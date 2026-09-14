import { clientTrackingConfig } from "@/lib/tracking/client/config";
import {
  captureGa4Event,
  type GoogleIdentifiers,
} from "@/lib/tracking/client/ga4";
import { captureMetaPixelEvent } from "@/lib/tracking/client/meta";
import { getPersistedMetaClickIds } from "@/lib/tracking/client/meta-clicks";
import {
  capturePostHogEvent,
  getPostHogSessionId,
} from "@/lib/tracking/client/posthog";
import {
  type TrackingEvent,
  type TrackingEventName,
  type TrackingEventOf,
  type TrackingProperties,
  type TrackingSource,
  trackingEventSchema,
} from "@/lib/tracking/events";
import { createTrackingId, getVisitorId } from "@/lib/tracking/ids";
import { asHttpUrl, currentTrackingUrl } from "@/lib/tracking/urls";

type CreateEventOptions = {
  source: TrackingSource;
  google?: GoogleIdentifiers;
};

type DispatchOptions = {
  immediate?: boolean;
};

export function createTrackingEvent<Name extends TrackingEventName>(
  name: Name,
  properties: TrackingProperties<Name>,
  options: CreateEventOptions,
): TrackingEventOf<Name> {
  const pathname = window.location.pathname;
  const clickIds = getPersistedMetaClickIds();
  const event = trackingEventSchema.parse({
    event_id: createTrackingId(),
    occurred_at: new Date().toISOString(),
    visitor_id: getVisitorId(),
    locale: getLocale(pathname),
    path: pathname,
    url: currentTrackingUrl(),
    source: options.source,
    posthog_session_id: getPostHogSessionId() || undefined,
    ga_client_id: options.google?.clientId || undefined,
    ga_session_id: options.google?.sessionId || undefined,
    fbp: clickIds.fbp,
    fbc: clickIds.fbc,
    name,
    properties: {
      ...properties,
      ...(name === "pageview"
        ? {
            referrer: asHttpUrl((properties as { referrer?: string }).referrer),
          }
        : {}),
    },
  });

  return event as TrackingEventOf<Name>;
}

export function trackClientEvent<
  Name extends Exclude<TrackingEventName, "purchase">,
>(
  name: Name,
  properties: TrackingProperties<Name>,
  options: CreateEventOptions & DispatchOptions,
) {
  try {
    const event = createTrackingEvent(name, properties, options);
    dispatchBrowserEvent(event, options);
    sendMetaCapiRelay(event, options);
    return event;
  } catch {
    return undefined;
  }
}

export function dispatchAcceptedPurchase(event: TrackingEventOf<"purchase">) {
  captureMetaPixelEvent(event);
  captureGa4Event(event, { immediate: true });
}

function dispatchBrowserEvent(event: TrackingEvent, options: DispatchOptions) {
  try {
    capturePostHogEvent(event, options);
  } catch {
    // Provider delivery is independent.
  }
  try {
    captureMetaPixelEvent(event);
  } catch {
    // Provider delivery is independent.
  }
  try {
    captureGa4Event(event, options);
  } catch {
    // Provider delivery is independent.
  }
}

function sendMetaCapiRelay(
  event: Exclude<TrackingEvent, TrackingEventOf<"purchase">>,
  options: DispatchOptions,
) {
  if (!clientTrackingConfig.metaPixelId) {
    return;
  }

  const body = JSON.stringify(event);
  try {
    if (options.immediate && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/tracking",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }

    void fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: Boolean(options.immediate),
    }).catch(() => undefined);
  } catch {
    // CAPI relay is best-effort and must never break the UI.
  }
}

function getLocale(pathname: string): "lt" | "en" {
  const candidate = pathname.split("/")[1] || document.documentElement.lang;
  return candidate === "en" ? "en" : "lt";
}
