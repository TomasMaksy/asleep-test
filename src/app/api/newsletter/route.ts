import { NextResponse } from "next/server";

type NewsletterBody = {
  email?: string;
  source?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_SOURCE_LENGTH = 64;

export async function POST(request: Request) {
  let body: NewsletterBody;

  try {
    body = (await request.json()) as NewsletterBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.email !== "string") {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim().slice(0, MAX_SOURCE_LENGTH)
      : "website-footer";

  if (!email) {
    return NextResponse.json(
      { error: "Please enter your email address." },
      { status: 400 },
    );
  }

  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const token = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;

  if (!token || !baseId || !tableId) {
    return NextResponse.json(
      { error: "Newsletter is not configured yet." },
      { status: 503 },
    );
  }

  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              "Email Address": email,
              Source: source,
            },
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the newsletter service. Please try again." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("Airtable newsletter error:", response.status, detail);

    if (response.status === 422 && /unique|duplicate|already/i.test(detail)) {
      return NextResponse.json({
        ok: true,
        alreadySubscribed: true,
      });
    }

    return NextResponse.json(
      { error: "Could not save your email. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
