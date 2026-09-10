import enContact from "../../messages/en/contact.json";
import ltContact from "../../messages/lt/contact.json";

const EMAIL_COPY = {
  en: enContact.email,
  lt: ltContact.email,
} as const;

const INBOX_EMAIL = process.env.CONTACT_INBOX_EMAIL ?? "info@asleep.lt";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "asleep <info@asleep.lt>";

type ContactEmailInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
  locale: string;
  cart?: string[];
};

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toHtml(text: string) {
  return `<pre style="font-family:inherit;font-size:16px;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
}

function copyFor(locale: string) {
  return locale === "en" ? EMAIL_COPY.en : EMAIL_COPY.lt;
}

async function sendResendEmail(input: {
  apiKey: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [input.to],
      reply_to: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: toHtml(input.text),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail}`);
  }
}

export async function sendContactThreadEmails(input: ContactEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { configured: false, ok: true };
  }

  const t = copyFor(input.locale);
  const vars = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
  };

  const customerText = interpolate(t.customerBody, vars);
  const inboxText = [
    interpolate(t.inboxBody, vars),
    input.phone ? interpolate(t.inboxPhone, vars) : "",
    input.cart?.length ? `${t.inboxCart}\n${input.cart.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await Promise.all([
      sendResendEmail({
        apiKey,
        to: input.email,
        replyTo: INBOX_EMAIL,
        subject: interpolate(t.customerSubject, vars),
        text: customerText,
      }),
      sendResendEmail({
        apiKey,
        to: INBOX_EMAIL,
        replyTo: `${input.name} <${input.email}>`,
        subject: interpolate(t.inboxSubject, vars),
        text: inboxText,
      }),
    ]);
    return { configured: true, ok: true };
  } catch (error) {
    console.error("Contact email send failed:", error);
    return { configured: true, ok: false };
  }
}
