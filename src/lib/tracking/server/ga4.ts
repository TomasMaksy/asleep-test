import type { TrackingEventOf } from "@/lib/tracking/events";
import { logTrackingIssue } from "@/lib/tracking/log";
import { serverTrackingConfig } from "@/lib/tracking/server/config";

export function buildGa4MeasurementPayload(event: TrackingEventOf<"purchase">) {
  return {
    client_id: event.ga_client_id,
    timestamp_micros: new Date(event.occurred_at).getTime() * 1000,
    events: [
      {
        name: "purchase",
        params: {
          checkout_mode: event.properties.checkout_mode,
          coupon: event.properties.coupon,
          currency: event.properties.currency,
          event_id: event.event_id,
          items: event.properties.items,
          page_location: event.url,
          payment_method: event.properties.payment_method,
          session_id: event.ga_session_id,
          transaction_id: event.properties.checkout_id,
          value: event.properties.value,
          visitor_id: event.visitor_id,
        },
      },
    ],
  };
}

export function ga4CollectUrl() {
  const endpoint =
    process.env.NODE_ENV === "production"
      ? "https://www.google-analytics.com/mp/collect"
      : "https://www.google-analytics.com/debug/mp/collect";
  const url = new URL(endpoint);
  url.searchParams.set("measurement_id", serverTrackingConfig.ga4MeasurementId);
  url.searchParams.set("api_secret", serverTrackingConfig.ga4ApiSecret);
  return url;
}

export async function sendGa4MeasurementPurchase(
  event: TrackingEventOf<"purchase">,
) {
  if (
    !serverTrackingConfig.ga4MeasurementId ||
    !serverTrackingConfig.ga4ApiSecret
  ) {
    logTrackingIssue(
      {
        provider: "ga4",
        eventName: event.name,
        eventId: event.event_id,
        reason: "missing_credentials",
      },
      { once: "ga4-server-creds" },
    );
    return;
  }
  if (!event.ga_client_id) {
    logTrackingIssue({
      provider: "ga4",
      eventName: event.name,
      eventId: event.event_id,
      reason: "missing_client_id",
    });
    return;
  }

  const response = await fetch(ga4CollectUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGa4MeasurementPayload(event)),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(
      `GA4 Measurement Protocol request failed (${response.status}).`,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    await assertGa4Validation(response);
  }
}

async function assertGa4Validation(response: Response) {
  try {
    const body = (await response.clone().json()) as {
      validationMessages?: { description?: string }[];
    };
    const messages = body.validationMessages ?? [];
    if (messages.length > 0) {
      throw new Error(
        `GA4 Measurement Protocol request failed (400): ${messages
          .map((message) => message.description)
          .filter(Boolean)
          .join("; ")}`,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("GA4")) {
      throw error;
    }
  }
}
