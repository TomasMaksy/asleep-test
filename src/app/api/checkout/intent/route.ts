import { NextResponse } from "next/server";
import { checkoutConfig } from "@/lib/checkout-config";
import { getStripe } from "@/lib/stripe-server";
import {
  consumeMutationRateLimit,
  isSameOriginRequest,
} from "@/lib/tracking/server/request";

const MAX_AMOUNT_CENTS = 500_000;
const MIN_AMOUNT_CENTS = 50;

function asAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return Math.round(amount);
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

  let body: {
    amountCents?: unknown;
    currency?: unknown;
    email?: unknown;
    name?: unknown;
    phone?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const amount = asAmount(body.amountCents);
  if (amount < MIN_AMOUNT_CENTS || amount > MAX_AMOUNT_CENTS) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const currency =
    typeof body.currency === "string"
      ? body.currency.toLowerCase()
      : checkoutConfig.currency.toLowerCase();
  const email =
    typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
  const name =
    typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
  const names = name.split(/\s+/).filter(Boolean);

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      capture_method: "manual",
      automatic_payment_methods: { enabled: true },
      description: "asleep checkout — authorization only, will not be captured",
      receipt_email: email.includes("@") ? email : undefined,
      metadata: {
        asleep_fake_door: "true",
        email,
        firstName: names[0] ?? "",
        lastName: names.slice(1).join(" "),
        phone,
      },
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    });
  } catch (error) {
    console.error("Stripe intent create failed:", error);
    return NextResponse.json(
      { error: "Could not start wallet payment." },
      { status: 502 },
    );
  }
}
