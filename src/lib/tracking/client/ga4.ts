import { clientTrackingConfig } from "@/lib/tracking/client/config";
import type { TrackingEvent } from "@/lib/tracking/events";
import { TRACKING_EVENT_REGISTRY } from "@/lib/tracking/events";
import { buildGa4GtagUserData } from "@/lib/tracking/ga4-user-data";
import { isGoogleDebugMode } from "@/lib/tracking/google-debug";
import {
  createGaClientId,
  type GoogleIdentifiers,
  googleIdentifiersFromCookies,
  parseCookieHeader,
} from "@/lib/tracking/google-ids";
import { logTrackingIssue } from "@/lib/tracking/log";
import type { MetaContact } from "@/lib/tracking/meta-user-data";

export type { GoogleIdentifiers };

let initialized = false;
const GOOGLE_IDENTIFIERS_KEY = "asleep.tracking.google_identifiers";

export function initializeGoogleTag() {
  const measurementId = clientTrackingConfig.ga4MeasurementId;
  if (initialized) {
    return;
  }
  if (!measurementId) {
    logTrackingIssue(
      { provider: "ga4", reason: "missing_measurement_id" },
      { once: "ga4-missing-id" },
    );
    return;
  }

  initialized = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js only treats Arguments objects as commands, not Arrays.
    // biome-ignore lint/complexity/noArguments: official gtag snippet requires arguments
    window.dataLayer?.push(arguments);
  };

  const seeded = seedGoogleIdentifiers(measurementId);
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    page_path: window.location.pathname,
    ...(seeded.fromCookie || !seeded.clientId
      ? {}
      : { client_id: seeded.clientId }),
    ...(isGoogleDebugMode() ? { debug_mode: true } : {}),
  });

  if (!document.querySelector('script[data-asleep-google-tag="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.asleepGoogleTag = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  }
}

export function identifyGa4User(contact: MetaContact) {
  if (!initialized || !window.gtag) {
    return;
  }
  const userData = buildGa4GtagUserData(contact);
  if (!userData) {
    return;
  }
  window.gtag("set", "user_data", userData);
}

export function buildGa4EventParams(event: TrackingEvent) {
  const common = {
    event_id: event.event_id,
    page_location: event.url,
    page_path: event.path,
    tracking_source: event.source,
    visitor_id: event.visitor_id,
  };

  if (event.name === "pageview") {
    return {
      ...common,
      page_title: event.properties.page_title,
      page_referrer: event.properties.referrer,
    };
  }

  if (!("items" in event.properties)) {
    return common;
  }

  const ecommerce = {
    ...common,
    currency: event.properties.currency,
    items: event.properties.items,
    value: event.properties.value,
  };

  if (event.name === "checkout_initiated") {
    return {
      ...ecommerce,
      checkout_id: event.properties.checkout_id,
      coupon: event.properties.coupon,
    };
  }

  if (event.name === "purchase") {
    return {
      ...ecommerce,
      checkout_mode: event.properties.checkout_mode,
      coupon: event.properties.coupon,
      payment_method: event.properties.payment_method,
      transaction_id: event.properties.checkout_id,
    };
  }

  return ecommerce;
}

export function captureGa4Event(
  event: TrackingEvent,
  options: { immediate?: boolean } = {},
) {
  const mapping = TRACKING_EVENT_REGISTRY[event.name];
  if (mapping.ga4 === null) {
    return;
  }
  if (!initialized || !window.gtag) {
    logTrackingIssue(
      {
        provider: "ga4",
        eventName: event.name,
        eventId: event.event_id,
        reason: initialized ? "gtag_missing" : "not_initialized",
      },
      { once: "ga4-not-ready" },
    );
    return;
  }

  window.gtag("event", mapping.ga4, {
    ...buildGa4EventParams(event),
    ...(options.immediate ? { transport_type: "beacon" } : {}),
  });
}

export async function getGoogleIdentifiers(): Promise<GoogleIdentifiers> {
  const fallback = seedGoogleIdentifiers(clientTrackingConfig.ga4MeasurementId);
  if (!initialized || !window.gtag) {
    return fallback;
  }

  const timeoutMs = fallback.clientId ? 400 : 1200;
  const [clientId, sessionId] = await Promise.all([
    getGoogleField("client_id", timeoutMs),
    getGoogleField("session_id", timeoutMs),
  ]);

  const identifiers = {
    clientId: clientId ?? fallback.clientId,
    sessionId: sessionId ?? fallback.sessionId,
  };
  storeGoogleIdentifiers(identifiers);
  return identifiers;
}

function seedGoogleIdentifiers(
  measurementId: string,
): GoogleIdentifiers & { fromCookie: boolean } {
  const stored = readStoredGoogleIdentifiers();
  const cookies = googleIdentifiersFromCookies(
    parseCookieHeader(document.cookie),
    measurementId,
  );
  const identifiers: GoogleIdentifiers = {
    clientId:
      cookies.clientId ??
      stored.clientId ??
      (measurementId ? createGaClientId() : undefined),
    sessionId: cookies.sessionId ?? stored.sessionId,
  };
  storeGoogleIdentifiers(identifiers);
  return { ...identifiers, fromCookie: Boolean(cookies.clientId) };
}

function getGoogleField(field: "client_id" | "session_id", timeoutMs: number) {
  return new Promise<string | undefined>((resolve) => {
    let settled = false;
    const finish = (value?: string) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(value || undefined);
    };

    window.setTimeout(() => finish(), timeoutMs);
    window.gtag?.("get", clientTrackingConfig.ga4MeasurementId, field, finish);
  });
}

function readStoredGoogleIdentifiers(): GoogleIdentifiers {
  try {
    const value = sessionStorage.getItem(GOOGLE_IDENTIFIERS_KEY);
    return value ? (JSON.parse(value) as GoogleIdentifiers) : {};
  } catch {
    return {};
  }
}

function storeGoogleIdentifiers(identifiers: GoogleIdentifiers) {
  if (!identifiers.clientId && !identifiers.sessionId) {
    return;
  }
  try {
    sessionStorage.setItem(GOOGLE_IDENTIFIERS_KEY, JSON.stringify(identifiers));
  } catch {
    // Attribution enrichment is best effort.
  }
}
