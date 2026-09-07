import { NextResponse } from "next/server";
import { saveEmail, splitFullName } from "@/lib/airtable";
import { sendContactThreadEmails } from "@/lib/contact-email";

type CartItemBody = {
  id?: string;
  name?: string;
  variant?: string;
  quantity?: number;
  price?: number;
};

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  locale?: string;
  page?: string;
  referrer?: string;
  company?: string;
  cart?: CartItemBody[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 40;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_CART_ITEMS = 50;

function asTrimmedString(value: unknown, max: number) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, max);
}

function sanitizeCart(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.slice(0, MAX_CART_ITEMS).flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const row = item as CartItemBody;
    const name = asTrimmedString(row.name, 160);
    if (!name) {
      return [];
    }

    const quantity = Number(row.quantity);
    const price = Number(row.price);

    return [
      {
        name,
        variant: asTrimmedString(row.variant, 120),
        quantity:
          Number.isFinite(quantity) && quantity > 0
            ? Math.min(99, Math.floor(quantity))
            : 1,
        price: Number.isFinite(price) && price >= 0 ? price : 0,
      },
    ];
  });
}

function formatCartLine(item: ReturnType<typeof sanitizeCart>[number]) {
  const variant = item.variant ? ` (${item.variant})` : "";
  return `${item.quantity}x ${item.name}${variant}`;
}

export async function POST(request: Request) {
  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (asTrimmedString(body.company, 120)) {
    return NextResponse.json({ ok: true });
  }

  const name = asTrimmedString(body.name, MAX_NAME_LENGTH);
  const email = asTrimmedString(body.email, MAX_EMAIL_LENGTH).toLowerCase();
  const phone = asTrimmedString(body.phone, MAX_PHONE_LENGTH);
  const message = asTrimmedString(body.message, MAX_MESSAGE_LENGTH);
  const locale = asTrimmedString(body.locale, 8) || "lt";
  const cart = sanitizeCart(body.cart);

  if (!name) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 },
    );
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: "Please enter a message." },
      { status: 400 },
    );
  }

  try {
    const cartTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    await saveEmail(email, "contact-form", {
      ...splitFullName(name),
      phone,
      cartBalance: cartTotal > 0 ? cartTotal : undefined,
    });
  } catch {
    // Keep sending the message even if Airtable is down.
  }

  const emailed = await sendContactThreadEmails({
    name,
    email,
    phone,
    message,
    locale,
    cart: cart.map(formatCartLine),
  });

  if (emailed.configured && !emailed.ok) {
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
