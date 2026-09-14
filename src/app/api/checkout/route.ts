import { after, NextResponse } from "next/server";
import { saveEmail } from "@/lib/airtable";
import { quoteCart } from "@/lib/product-catalog";
import {
  cartSelectionSchema,
  purchaseEventSchema,
  purchaseTrackingClientSchema,
  type TrackingEventOf,
} from "@/lib/tracking/events";
import { sendPurchaseToServers } from "@/lib/tracking/server/dispatch";
import { claimOnce } from "@/lib/tracking/server/idempotency";
import {
  isAllowedEventUrl,
  isTrustedSiteRequest,
} from "@/lib/tracking/server/origins";
import { isWithinReplayWindow } from "@/lib/tracking/server/replay";
import {
  consumeMutationRateLimit,
  getTrackingRequestContext,
} from "@/lib/tracking/server/request";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 80;
const MAX_PHONE_LENGTH = 40;
const MAX_CITY_LENGTH = 80;
const MAX_POSTAL_LENGTH = 16;
const MAX_BODY_BYTES = 64_000;

type CheckoutLead = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postal: string;
  locale: string;
  country: string;
  company: string;
};

function asTrimmedString(value: unknown, max: number) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, max);
}

/** Whitelist only — payment fields are ignored and never logged. */
function pickLead(body: unknown): CheckoutLead {
  const source = asRecord(body);

  return {
    firstName: asTrimmedString(source.firstName, MAX_NAME_LENGTH),
    lastName: asTrimmedString(source.lastName, MAX_NAME_LENGTH),
    email: asTrimmedString(source.email, MAX_EMAIL_LENGTH).toLowerCase(),
    phone: asTrimmedString(source.phone, MAX_PHONE_LENGTH),
    city: asTrimmedString(source.city, MAX_CITY_LENGTH),
    postal: asTrimmedString(source.postal, MAX_POSTAL_LENGTH),
    locale: asTrimmedString(source.locale, 8) || "lt",
    country: asTrimmedString(source.country, 2).toLowerCase(),
    company: asTrimmedString(source.company, 120),
  };
}

export async function POST(request: Request) {
  if (!isTrustedSiteRequest(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  if (!consumeMutationRateLimit(request, "checkout")) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const lead = pickLead(raw);
  const source = asRecord(raw);

  if (lead.company) {
    return NextResponse.json({ ok: true });
  }

  if (!lead.firstName) {
    return NextResponse.json(
      { error: "Please enter your first name." },
      { status: 400 },
    );
  }

  if (!lead.lastName) {
    return NextResponse.json(
      { error: "Please enter your last name." },
      { status: 400 },
    );
  }

  if (!lead.email || !EMAIL_RE.test(lead.email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (lead.phone && digitsIn(lead.phone) < 8) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  const quoted = quoteSubmittedCart(source);
  const purchase = buildPurchaseEvent(source.tracking, quoted);

  try {
    await saveEmail(lead.email, "checkout-completed", {
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      cartBalance: quoted?.value ?? 0,
    });
  } catch {
    // Lead is still accepted; Airtable can be retried later.
  }

  if (purchase) {
    const context = getTrackingRequestContext(request, purchase);
    after(() =>
      sendPurchaseToServers(purchase, context, {
        email: lead.email,
        phone: lead.phone,
        firstName: lead.firstName,
        lastName: lead.lastName,
        city: lead.city,
        postal: lead.postal,
        country: lead.country,
      }),
    );
  }

  return NextResponse.json({
    ok: true,
    trackingAccepted: Boolean(purchase),
    purchase: purchase ?? undefined,
  });
}

function quoteSubmittedCart(source: Record<string, unknown>) {
  const items = cartSelectionSchema.array().max(20).safeParse(source.items);
  if (!items.success) {
    return undefined;
  }
  const coupon = typeof source.coupon === "string" ? source.coupon : undefined;
  return quoteCart(items.data, coupon);
}

function buildPurchaseEvent(
  rawTracking: unknown,
  quoted: ReturnType<typeof quoteSubmittedCart>,
): TrackingEventOf<"purchase"> | undefined {
  if (!quoted) {
    return undefined;
  }

  const tracking = purchaseTrackingClientSchema.safeParse(rawTracking);
  if (!tracking.success) {
    return undefined;
  }

  if (
    !isWithinReplayWindow(tracking.data.occurred_at) ||
    !isAllowedEventUrl(tracking.data.url)
  ) {
    return undefined;
  }

  if (
    !claimOnce(`checkout:${tracking.data.checkout_id}`) ||
    !claimOnce(`event:${tracking.data.event_id}`)
  ) {
    return undefined;
  }

  const parsed = purchaseEventSchema.safeParse({
    ...tracking.data,
    name: "purchase",
    properties: {
      checkout_id: tracking.data.checkout_id,
      checkout_mode: "fake_door",
      coupon: quoted.coupon,
      currency: "EUR",
      items: quoted.items,
      payment_method: tracking.data.payment_method,
      value: quoted.value,
    },
  });

  return parsed.success ? parsed.data : undefined;
}

function digitsIn(value: string) {
  return value.replace(/\D/g, "").length;
}

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}
