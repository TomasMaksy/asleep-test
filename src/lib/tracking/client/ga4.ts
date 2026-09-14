import { clientTrackingConfig } from "@/lib/tracking/client/config";
import type { TrackingEvent } from "@/lib/tracking/events";
import { TRACKING_EVENT_REGISTRY } from "@/lib/tracking/events";

let initialized = false;
const GOOGLE_IDENTIFIERS_KEY = "asleep.tracking.google_identifiers";

export type GoogleIdentifiers = {
  clientId?: string;
  sessionId?: string;
};

export function initializeGoogleTag() {
  const measurementId = clientTrackingConfig.ga4MeasurementId;
  if (initialized || !measurementId) {
    return;
  }

  initialized = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    page_path: window.location.pathname,
    debug_mode: process.env.NODE_ENV !== "production",
  });

  if (!document.querySelector('script[data-asleep-google-tag="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.asleepGoogleTag = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  }
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
  if (!initialized || !window.gtag) {
    return;
  }

  window.gtag("event", TRACKING_EVENT_REGISTRY[event.name].ga4, {
    ...buildGa4EventParams(event),
    transport_type: options.immediate ? "beacon" : undefined,
  });
}

export async function getGoogleIdentifiers(): Promise<GoogleIdentifiers> {
  const stored = readStoredGoogleIdentifiers();
  const cookies = readGoogleIdentifiersFromCookies();
  const fallback: GoogleIdentifiers = {
    clientId: cookies.clientId ?? stored.clientId,
    sessionId: cookies.sessionId ?? stored.sessionId,
  };
  storeGoogleIdentifiers(fallback);
  if (!initialized || !window.gtag) {
    return fallback;
  }

  const [clientId, sessionId] = await Promise.all([
    getGoogleField("client_id"),
    getGoogleField("session_id"),
  ]);

  const identifiers = {
    clientId: clientId ?? fallback.clientId,
    sessionId: sessionId ?? fallback.sessionId,
  };
  storeGoogleIdentifiers(identifiers);
  return identifiers;
}

function getGoogleField(field: "client_id" | "session_id") {
  return new Promise<string | undefined>((resolve) => {
    let settled = false;
    const finish = (value?: string) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(value || undefined);
    };

    window.setTimeout(() => finish(), 600);
    window.gtag?.("get", clientTrackingConfig.ga4MeasurementId, field, finish);
  });
}

function readGoogleIdentifiersFromCookies(): GoogleIdentifiers {
  const cookies = Object.fromEntries(
    document.cookie.split(";").flatMap((entry) => {
      const separator = entry.indexOf("=");
      if (separator < 0) {
        return [];
      }
      return [
        [
          entry.slice(0, separator).trim(),
          decodeURIComponent(entry.slice(separator + 1)),
        ],
      ];
    }),
  );

  const gaParts = cookies._ga?.split(".");
  const clientId =
    gaParts && gaParts.length >= 4 ? gaParts.slice(-2).join(".") : undefined;
  const streamCookieName = `_ga_${clientTrackingConfig.ga4MeasurementId.replace(/^G-/, "")}`;
  const streamCookie = cookies[streamCookieName];
  const sessionId =
    streamCookie?.match(/(?:^|[.$])s(\d+)(?:[.$]|$)/)?.[1] ??
    streamCookie?.match(/^GS\d+\.\d+\.(\d+)/)?.[1];

  return { clientId, sessionId };
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
