import { clientTrackingConfig } from "@/lib/tracking/client/config";
import type { TrackingEvent } from "@/lib/tracking/events";
import { TRACKING_EVENT_REGISTRY } from "@/lib/tracking/events";

let initialized = false;

export function initializeMetaPixel() {
  if (initialized || !clientTrackingConfig.metaPixelId) {
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
  fbq("init", clientTrackingConfig.metaPixelId);

  if (!document.querySelector('script[data-asleep-meta-pixel="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.asleepMetaPixel = "true";
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.append(script);
  }
}

export function buildMetaPixelData(event: TrackingEvent) {
  if (event.name === "pageview") {
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
  if (!initialized || !window.fbq) {
    return;
  }

  window.fbq(
    "track",
    TRACKING_EVENT_REGISTRY[event.name].meta,
    buildMetaPixelData(event),
    { eventID: event.event_id },
  );
}
