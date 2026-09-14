import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe-server";
import {
  consumeMutationRateLimit,
  isSameOriginRequest,
} from "@/lib/tracking/server/request";

function asId(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, 64);
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  if (!consumeMutationRateLimit(request, "intent")) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Wallet checkout needs Stripe test keys." },
      { status: 503 },
    );
  }

  let body: { paymentIntentId?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const paymentIntentId = asId(body.paymentIntentId);
  if (!paymentIntentId.startsWith("pi_")) {
    return NextResponse.json({ error: "Invalid payment." }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    if (intent.metadata?.asleep_fake_door !== "true") {
      return NextResponse.json({ error: "Invalid payment." }, { status: 400 });
    }

    const charge =
      intent.latest_charge && typeof intent.latest_charge !== "string"
        ? intent.latest_charge
        : null;
    const billing = charge?.billing_details;
    const contact = {
      email:
        billing?.email || intent.receipt_email || intent.metadata?.email || "",
      name:
        billing?.name ||
        intent.shipping?.name ||
        `${intent.metadata?.firstName ?? ""} ${intent.metadata?.lastName ?? ""}`.trim(),
      firstName: intent.metadata?.firstName || "",
      lastName: intent.metadata?.lastName || "",
      phone:
        billing?.phone ||
        intent.shipping?.phone ||
        intent.metadata?.phone ||
        "",
    };

    if (intent.status === "succeeded") {
      await stripe.refunds.create({ payment_intent: paymentIntentId });
    } else if (intent.status !== "canceled") {
      await stripe.paymentIntents.cancel(paymentIntentId);
    }

    return NextResponse.json({ ok: true, ...contact });
  } catch (error) {
    console.error("Stripe void failed:", error);
    return NextResponse.json(
      { error: "Could not cancel the authorization." },
      { status: 502 },
    );
  }
}
