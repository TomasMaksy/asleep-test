import type { TrackingEventOf } from "@/lib/tracking/events";
import {
  buildGa4MeasurementUserData,
  type Ga4MeasurementUserData,
} from "@/lib/tracking/ga4-user-data";
import { isGoogleDebugMode } from "@/lib/tracking/google-debug";
import { ga4SessionIdNumber } from "@/lib/tracking/google-ids";
import { logTrackingIssue } from "@/lib/tracking/log";
import type { MetaContact } from "@/lib/tracking/meta-user-data";
import { serverTrackingConfig } from "@/lib/tracking/server/config";
import type { TrackingRequestContext } from "@/lib/tracking/server/request";

const GA4_COLLECT_ORIGIN = "https://region1.google-analytics.com";
export const GA4_MEASUREMENT_ENGAGEMENT_TIME_MSEC = 100;

type Ga4MeasurementOptions = {
  clientId?: string;
  sessionId?: string;
  userData?: Ga4MeasurementUserData;
  debugMode?: boolean;
};

export function buildGa4MeasurementPayload(
  event: TrackingEventOf<"purchase">,
  options: Ga4MeasurementOptions = {},
) {
  const sessionId = ga4SessionIdNumber(
    options.sessionId ?? event.ga_session_id,
  );
  const debugMode = options.debugMode ?? isGoogleDebugMode();

  return {
    client_id: options.clientId ?? event.ga_client_id,
    timestamp_micros: new Date(event.occurred_at).getTime() * 1000,
    ...(options.userData
      ? { user_id: event.visitor_id, user_data: options.userData }
      : {}),
    events: [
      {
        name: "purchase",
        params: {
          checkout_mode: event.properties.checkout_mode,
          coupon: event.properties.coupon,
          currency: event.properties.currency,
          engagement_time_msec: GA4_MEASUREMENT_ENGAGEMENT_TIME_MSEC,
          event_id: event.event_id,
          items: event.properties.items,
          page_location: event.url,
          payment_method: event.properties.payment_method,
          ...(sessionId !== undefined ? { session_id: sessionId } : {}),
          transaction_id: event.properties.checkout_id,
          value: event.properties.value,
          visitor_id: event.visitor_id,
          ...(debugMode ? { debug_mode: true } : {}),
        },
      },
    ],
  };
}

export function ga4CollectUrl() {
  return ga4EndpointUrl("/mp/collect");
}

export function ga4ValidationUrl() {
  return ga4EndpointUrl("/debug/mp/collect");
}

export async function sendGa4MeasurementPurchase(
  event: TrackingEventOf<"purchase">,
  context: TrackingRequestContext = {},
  contact: MetaContact = {},
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

  const clientId = event.ga_client_id || context.gaClientId;
  if (!clientId) {
    logTrackingIssue({
      provider: "ga4",
      eventName: event.name,
      eventId: event.event_id,
      reason: "missing_client_id",
    });
    return;
  }

  const payload = buildGa4MeasurementPayload(event, {
    clientId,
    sessionId: event.ga_session_id || context.gaSessionId,
    userData: await buildGa4MeasurementUserData(contact),
    debugMode: isGoogleDebugMode(),
  });

  if (process.env.NODE_ENV !== "production") {
    const validation = await fetch(ga4ValidationUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        validation_behavior: "ENFORCE_RECOMMENDATIONS",
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!validation.ok) {
      throw new Error(
        `GA4 Measurement Protocol request failed (${validation.status}).`,
      );
    }
    await assertGa4Validation(validation);
  }

  const response = await fetch(ga4CollectUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(
      `GA4 Measurement Protocol request failed (${response.status}).`,
    );
  }
}

function ga4EndpointUrl(path: "/mp/collect" | "/debug/mp/collect") {
  const url = new URL(path, GA4_COLLECT_ORIGIN);
  url.searchParams.set("measurement_id", serverTrackingConfig.ga4MeasurementId);
  url.searchParams.set("api_secret", serverTrackingConfig.ga4ApiSecret);
  return url;
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
