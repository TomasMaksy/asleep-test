import { clientTrackingConfig } from "@/lib/tracking/client/config";
import {
  captureGa4Event,
  type GoogleIdentifiers,
  identifyGa4User,
} from "@/lib/tracking/client/ga4";
import {
  captureMetaPixelEvent,
  identifyMetaPixelUser,
} from "@/lib/tracking/client/meta";
import { getPersistedMetaClickIds } from "@/lib/tracking/client/meta-clicks";
import {
  capturePostHogEvent,
  getPostHogSessionId,
} from "@/lib/tracking/client/posthog";
import {
  isPostHogOnlyEventName,
  type TrackingEvent,
  type TrackingEventName,
  type TrackingEventOf,
  type TrackingProperties,
  type TrackingSource,
  trackingEventSchema,
} from "@/lib/tracking/events";
import { createTrackingId, getVisitorId } from "@/lib/tracking/ids";
import { logTrackingIssue, trackingErrorMessage } from "@/lib/tracking/log";
import type { MetaContact } from "@/lib/tracking/meta-user-data";
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
  } catch (error) {
    logTrackingIssue({
      eventName: name,
      reason: trackingErrorMessage(error),
    });
    return undefined;
  }
}

export async function dispatchAcceptedPurchase(
  event: TrackingEventOf<"purchase">,
  contact: MetaContact,
) {
  try {
    await identifyMetaPixelUser(contact);
  } catch (error) {
    logTrackingIssue({
      provider: "meta",
      eventName: event.name,
      eventId: event.event_id,
      reason: trackingErrorMessage(error),
    });
  }
  try {
    identifyGa4User(contact);
  } catch (error) {
    logTrackingIssue({
      provider: "ga4",
      eventName: event.name,
      eventId: event.event_id,
      reason: trackingErrorMessage(error),
    });
  }
  captureMetaPixelEvent(event);
  captureGa4Event(event, { immediate: true });
}

function dispatchBrowserEvent(event: TrackingEvent, options: DispatchOptions) {
  try {
    capturePostHogEvent(event, options);
  } catch (error) {
    logTrackingIssue({
      provider: "posthog",
      eventName: event.name,
      eventId: event.event_id,
      reason: trackingErrorMessage(error),
    });
  }
  if (isPostHogOnlyEventName(event.name)) {
    return;
  }
  try {
    captureMetaPixelEvent(event);
  } catch (error) {
    logTrackingIssue({
      provider: "meta",
      eventName: event.name,
      eventId: event.event_id,
      reason: trackingErrorMessage(error),
    });
  }
  try {
    captureGa4Event(event, options);
  } catch (error) {
    logTrackingIssue({
      provider: "ga4",
      eventName: event.name,
      eventId: event.event_id,
      reason: trackingErrorMessage(error),
    });
  }
}

function sendMetaCapiRelay(
  event: Exclude<TrackingEvent, TrackingEventOf<"purchase">>,
  options: DispatchOptions,
) {
  if (!clientTrackingConfig.metaPixelId || isPostHogOnlyEventName(event.name)) {
    return;
  }

  const body = JSON.stringify(event);
  try {
    if (options.immediate && navigator.sendBeacon) {
      if (
        !navigator.sendBeacon(
          "/api/tracking",
          new Blob([body], { type: "application/json" }),
        )
      ) {
        logTrackingIssue({
          provider: "meta",
          eventName: event.name,
          eventId: event.event_id,
          reason: "capi_beacon_rejected",
        });
      }
      return;
    }

    void fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) {
          logTrackingIssue({
            provider: "meta",
            eventName: event.name,
            eventId: event.event_id,
            reason: "capi_relay_rejected",
            status: response.status,
          });
        }
      })
      .catch((error) => {
        logTrackingIssue({
          provider: "meta",
          eventName: event.name,
          eventId: event.event_id,
          reason: trackingErrorMessage(error),
        });
      });
  } catch (error) {
    logTrackingIssue({
      provider: "meta",
      eventName: event.name,
      eventId: event.event_id,
      reason: trackingErrorMessage(error),
    });
  }
}

function getLocale(pathname: string): "lt" | "en" {
  const candidate = pathname.split("/")[1] || document.documentElement.lang;
  return candidate === "en" ? "en" : "lt";
}
