import { NextResponse } from "next/server";
import { saveEmail } from "@/lib/airtable";

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

  try {
    const result = await saveEmail(email, source);
    if (!result.configured) {
      return NextResponse.json(
        { error: "Newsletter is not configured yet." },
        { status: 503 },
      );
    }
    if (!result.ok) {
      return NextResponse.json(
        { error: "Could not save your email. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      alreadySubscribed: Boolean(result.alreadySubscribed),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the newsletter service. Please try again." },
      { status: 502 },
    );
  }
}
