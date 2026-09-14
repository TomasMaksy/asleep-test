import type { TrackingEvent, TrackingEventOf } from "@/lib/tracking/events";
import { sendGa4MeasurementPurchase } from "@/lib/tracking/server/ga4";
import {
  type MetaContact,
  sendMetaCapiEvent,
} from "@/lib/tracking/server/meta";
import { capturePostHogPurchase } from "@/lib/tracking/server/posthog";
import type { TrackingRequestContext } from "@/lib/tracking/server/request";
import { withProviderRetry } from "@/lib/tracking/server/retry";

export async function sendBrowserEventToMeta(
  event: Exclude<TrackingEvent, TrackingEventOf<"purchase">>,
  context: TrackingRequestContext,
) {
  await Promise.allSettled([
    withProviderRetry("meta", event.name, event.event_id, () =>
      sendMetaCapiEvent(event, context),
    ),
  ]);
}

export async function sendPurchaseToServers(
  event: TrackingEventOf<"purchase">,
  context: TrackingRequestContext,
  contact: MetaContact,
) {
  await Promise.allSettled([
    withProviderRetry("posthog", event.name, event.event_id, () =>
      capturePostHogPurchase(event, contact),
    ),
    withProviderRetry("meta", event.name, event.event_id, () =>
      sendMetaCapiEvent(event, context, contact),
    ),
    withProviderRetry("ga4", event.name, event.event_id, () =>
      sendGa4MeasurementPurchase(event),
    ),
  ]);
}
