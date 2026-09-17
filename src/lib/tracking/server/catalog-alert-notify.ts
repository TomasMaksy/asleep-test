import { saveTrackingCatalogAlert } from "@/lib/airtable-tracking-alerts";
import type { CatalogAlertPayload } from "@/lib/tracking/catalog-alert";
import { logTrackingIssue, trackingErrorMessage } from "@/lib/tracking/log";

const ALERT_TO =
  process.env.TRACKING_ALERT_EMAIL?.trim() || "maksimovictom@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "asleep <info@asleep.lt>";

function environmentLabel() {
  return (
    process.env.VERCEL_ENV ||
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.NODE_ENV ||
    "unknown"
  );
}

async function sendAlertEmail(payload: CatalogAlertPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false as const, configured: false };
  }

  const occurredAt = new Date().toISOString();
  const text = [
    "Ecommerce tracking dropped a catalog lookup.",
    "",
    `Event: ${payload.eventName}`,
    `Source: ${payload.source}`,
    `Reason: ${payload.reason}`,
    `Cart IDs: ${payload.cartIds.join(", ") || "(none)"}`,
    `Path: ${payload.path ?? "(unknown)"}`,
    `URL: ${payload.url ?? "(unknown)"}`,
    `Environment: ${environmentLabel()}`,
    `Occurred: ${occurredAt}`,
    "",
    "Meta/GA4/PostHog did not receive this ecommerce event.",
    "Check product-catalog.ts / cart line ids.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [ALERT_TO],
      subject: `[asleep] tracking catalog_mismatch: ${payload.eventName}`,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail}`);
  }

  return { ok: true as const, configured: true };
}

/** Email + Airtable row for a catalog mismatch. Never throws to callers. */
export async function notifyCatalogMismatch(payload: CatalogAlertPayload) {
  const occurredAt = new Date().toISOString();

  try {
    await sendAlertEmail(payload);
  } catch (error) {
    logTrackingIssue({
      eventName: payload.eventName,
      reason: `alert_email:${trackingErrorMessage(error)}`,
    });
  }

  try {
    await saveTrackingCatalogAlert({
      occurredAt,
      eventName: payload.eventName,
      source: payload.source,
      cartIds: payload.cartIds.join("\n") || "(none)",
      path: payload.path ?? "",
      url: payload.url ?? "",
      reason: payload.reason,
      environment: environmentLabel(),
    });
  } catch (error) {
    logTrackingIssue({
      eventName: payload.eventName,
      reason: `alert_airtable:${trackingErrorMessage(error)}`,
    });
  }
}
