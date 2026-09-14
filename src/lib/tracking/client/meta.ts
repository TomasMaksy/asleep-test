import { clientTrackingConfig } from "@/lib/tracking/client/config";
import type { TrackingEvent } from "@/lib/tracking/events";
import { TRACKING_EVENT_REGISTRY } from "@/lib/tracking/events";
import { getVisitorId } from "@/lib/tracking/ids";
import { logTrackingIssue, trackingErrorMessage } from "@/lib/tracking/log";
import {
  buildMetaPixelUserData,
  hashMetaExternalId,
  type MetaContact,
} from "@/lib/tracking/meta-user-data";

let initialized = false;
let pendingContact: MetaContact = {};
let matchingGate = Promise.resolve();

export function initializeMetaPixel() {
  if (initialized) {
    return;
  }
  if (!clientTrackingConfig.metaPixelId) {
    logTrackingIssue(
      { provider: "meta", reason: "missing_pixel_id" },
      { once: "meta-missing-id" },
    );
    return;
  }

  initialized = true;

  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }
      fbq.queue.push(args);
    }) as MetaPixelFunction;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  const fbq = window.fbq;
  if (!fbq) {
    return;
  }
  // Manual catalog only. autoConfig infers SubscribedButtonClick/Lead from
  // any <button>, including the size picker. disablePushState stops extra
  // PageViews on Next.js history changes.
  fbq.disablePushState = true;
  fbq("set", "autoConfig", false, clientTrackingConfig.metaPixelId);

  if (!document.querySelector('script[data-asleep-meta-pixel="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.asleepMetaPixel = "true";
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.append(script);
  }

  enqueueMatching(() => applyAdvancedMatching());
}

export async function identifyMetaPixelUser(contact: MetaContact) {
  pendingContact = { ...pendingContact, ...contact };
  if (!initialized || !clientTrackingConfig.metaPixelId) {
    return;
  }
  await enqueueMatching(() => applyAdvancedMatching());
}

export function buildMetaPixelData(event: TrackingEvent) {
  if (event.name === "pageview" || !("items" in event.properties)) {
    return {};
  }

  const data: Record<string, unknown> = {
    content_ids: event.properties.items.map((item) => item.item_id),
    content_name: event.properties.items[0]?.item_name,
    content_type: "product",
    contents: event.properties.items.map((item) => ({
      id: item.item_id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    currency: event.properties.currency,
    num_items: event.properties.items.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
    value: event.properties.value,
  };

  if (event.name === "checkout_initiated" || event.name === "purchase") {
    data.order_id = event.properties.checkout_id;
  }
  if (event.name === "purchase") {
    data.checkout_mode = event.properties.checkout_mode;
  }

  return data;
}

export function captureMetaPixelEvent(event: TrackingEvent) {
  const mapping = TRACKING_EVENT_REGISTRY[event.name];
  if (mapping.meta === null) {
    return;
  }
  if (!initialized || !window.fbq) {
    logTrackingIssue(
      {
        provider: "meta",
        eventName: event.name,
        eventId: event.event_id,
        reason: initialized ? "fbq_missing" : "not_initialized",
      },
      { once: "meta-not-ready" },
    );
    return;
  }

  const fire = () => {
    try {
      if (!window.fbq) {
        return;
      }
      window.fbq("track", mapping.meta, buildMetaPixelData(event), {
        eventID: event.event_id,
      });
    } catch (error) {
      logTrackingIssue({
        provider: "meta",
        eventName: event.name,
        eventId: event.event_id,
        reason: trackingErrorMessage(error),
      });
    }
  };

  void matchingGate.then(fire, fire);
}

function enqueueMatching(task: () => Promise<void>) {
  matchingGate = matchingGate.then(task, task);
  return matchingGate;
}

async function applyAdvancedMatching() {
  const fbq = window.fbq;
  const pixelId = clientTrackingConfig.metaPixelId;
  if (!fbq || !pixelId) {
    return;
  }

  let hashedExternalId: string | undefined;
  try {
    hashedExternalId = await hashMetaExternalId(getVisitorId());
  } catch (error) {
    logTrackingIssue(
      {
        provider: "meta",
        reason: trackingErrorMessage(error),
      },
      { once: "meta-external-id-hash" },
    );
  }

  // Manual Advanced Matching must live on init, not track(). Re-calling init
  // with the same Pixel ID updates user data for later events in this session.
  fbq(
    "init",
    pixelId,
    buildMetaPixelUserData(pendingContact, hashedExternalId),
  );
}
