import { createHash } from "node:crypto";
import type { TrackingEvent } from "@/lib/tracking/events";
import {
  isPostHogOnlyEventName,
  TRACKING_EVENT_REGISTRY,
} from "@/lib/tracking/events";
import { normalizePhoneE164 } from "@/lib/tracking/phone";
import { serverTrackingConfig } from "@/lib/tracking/server/config";
import type { TrackingRequestContext } from "@/lib/tracking/server/request";

export type MetaContact = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
};

export function buildMetaServerEvent(
  event: TrackingEvent,
  context: TrackingRequestContext,
  contact: MetaContact = {},
) {
  const mapping = TRACKING_EVENT_REGISTRY[event.name];
  if (mapping.meta === null) {
    throw new Error("PostHog-only events are not sent to Meta.");
  }

  const userData = compact({
    client_ip_address: context.clientIp,
    client_user_agent: context.userAgent,
    em: hashedArray(contact.email, normalizeEmail),
    ph: hashedArray(contact.phone, (value) =>
      normalizePhoneE164(value, contact.country),
    ),
    fn: hashedArray(contact.firstName, normalizeText),
    ln: hashedArray(contact.lastName, normalizeText),
    country: hashedArray(contact.country, normalizeText),
    external_id: [hash(event.visitor_id)],
    fbp: context.fbp,
    fbc: context.fbc,
  });

  return {
    event_name: mapping.meta,
    event_time: Math.floor(new Date(event.occurred_at).getTime() / 1000),
    event_id: event.event_id,
    event_source_url: event.url,
    action_source: "website",
    user_data: userData,
    custom_data: buildMetaCustomData(event),
  };
}

export async function sendMetaCapiEvent(
  event: TrackingEvent,
  context: TrackingRequestContext,
  contact: MetaContact = {},
) {
  if (
    !serverTrackingConfig.metaPixelId ||
    !serverTrackingConfig.metaAccessToken ||
    isPostHogOnlyEventName(event.name)
  ) {
    return;
  }

  const url = new URL(
    `https://graph.facebook.com/${serverTrackingConfig.metaGraphApiVersion}/${serverTrackingConfig.metaPixelId}/events`,
  );
  url.searchParams.set("access_token", serverTrackingConfig.metaAccessToken);

  const payload: Record<string, unknown> = {
    data: [buildMetaServerEvent(event, context, contact)],
  };
  if (serverTrackingConfig.metaTestEventCode) {
    payload.test_event_code = serverTrackingConfig.metaTestEventCode;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Meta CAPI request failed (${response.status}).`);
  }
}

function buildMetaCustomData(event: TrackingEvent) {
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

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashedArray(
  value: string | undefined,
  normalize: (input: string) => string,
) {
  if (!value) {
    return undefined;
  }
  const normalized = normalize(value);
  return normalized ? [hash(normalized)] : undefined;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function compact<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );
}
