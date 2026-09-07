import { NextResponse } from "next/server";
import { saveEmail } from "@/lib/airtable";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 80;
const MAX_PHONE_LENGTH = 40;

type CheckoutLead = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: string;
  company: string;
  cartBalance: number;
};

function asTrimmedString(value: unknown, max: number) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, max);
}

/** Whitelist only — payment fields are ignored and never logged. */
function pickLead(body: unknown): CheckoutLead {
  const source =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  return {
    firstName: asTrimmedString(source.firstName, MAX_NAME_LENGTH),
    lastName: asTrimmedString(source.lastName, MAX_NAME_LENGTH),
    email: asTrimmedString(source.email, MAX_EMAIL_LENGTH).toLowerCase(),
    phone: asTrimmedString(source.phone, MAX_PHONE_LENGTH),
    locale: asTrimmedString(source.locale, 8) || "lt",
    company: asTrimmedString(source.company, 120),
    cartBalance: asMoney(source.cartBalance),
  };
}

function asMoney(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  return Math.round(amount * 100) / 100;
}

export async function POST(request: Request) {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const lead = pickLead(raw);

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

  try {
    await saveEmail(lead.email, "checkout-completed", {
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      cartBalance: lead.cartBalance,
    });
  } catch {
    // Lead is still accepted; Airtable can be retried later.
  }

  return NextResponse.json({ ok: true });
}

function digitsIn(value: string) {
  return value.replace(/\D/g, "").length;
}
