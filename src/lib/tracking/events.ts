import { z } from "zod";

export const trackingItemSchema = z.object({
  item_id: z.string().trim().min(1).max(200),
  item_name: z.string().trim().min(1).max(200),
  item_variant: z.string().trim().max(200),
  size_id: z.string().trim().min(1).max(40),
  price: z.number().finite().nonnegative().max(1_000_000),
  quantity: z.number().int().positive().max(100),
  discount: z.number().finite().nonnegative().max(1_000_000).optional(),
});

export const cartSelectionSchema = z.object({
  id: z.string().trim().min(1).max(200),
  quantity: z.number().int().positive().max(10),
});

export const purchaseTrackingClientSchema = z.object({
  event_id: z.string().uuid(),
  occurred_at: z.string().datetime({ offset: true }),
  visitor_id: z.string().uuid(),
  locale: z.enum(["lt", "en"]),
  path: z.string().startsWith("/").max(1024),
  url: z.string().url().max(2048),
  source: z.literal("checkout_page"),
  posthog_session_id: z.string().trim().min(8).max(128).optional(),
  ga_client_id: z.string().trim().min(3).max(100).optional(),
  ga_session_id: z.string().trim().min(1).max(100).optional(),
  fbp: z.string().trim().min(8).max(200).optional(),
  fbc: z.string().trim().min(8).max(512).optional(),
  checkout_id: z.string().uuid(),
  payment_method: z.enum(["card", "express", "unknown"]),
});

const ecommerceSchema = z.object({
  currency: z.literal("EUR"),
  value: z.number().finite().nonnegative().max(1_000_000),
  items: z.array(trackingItemSchema).min(1).max(20),
});

const checkoutSchema = ecommerceSchema.extend({
  checkout_id: z.string().uuid(),
  coupon: z.string().trim().max(80).optional(),
});

const baseEventSchema = z.object({
  event_id: z.string().uuid(),
  occurred_at: z.string().datetime({ offset: true }),
  visitor_id: z.string().uuid(),
  locale: z.enum(["lt", "en"]),
  path: z.string().startsWith("/").max(1024),
  url: z.string().url().max(2048),
  source: z.enum([
    "route",
    "pdp_buy_box",
    "pdp_sticky_bar",
    "configurator",
    "cart",
    "checkout_page",
  ]),
  posthog_session_id: z.string().trim().min(8).max(128).optional(),
  ga_client_id: z.string().trim().min(3).max(100).optional(),
  ga_session_id: z.string().trim().min(1).max(100).optional(),
  fbp: z.string().trim().min(8).max(200).optional(),
  fbc: z.string().trim().min(8).max(512).optional(),
});

export const pageviewEventSchema = baseEventSchema.extend({
  name: z.literal("pageview"),
  source: z.literal("route"),
  properties: z.object({
    page_title: z.string().trim().max(300),
    referrer: z.string().url().max(2048).optional(),
  }),
});

export const productViewedEventSchema = baseEventSchema.extend({
  name: z.literal("product_viewed"),
  source: z.literal("route"),
  properties: ecommerceSchema,
});

export const addToCartEventSchema = baseEventSchema.extend({
  name: z.literal("add_to_cart"),
  source: z.enum(["pdp_buy_box", "pdp_sticky_bar", "configurator"]),
  properties: ecommerceSchema,
});

export const checkoutInitiatedEventSchema = baseEventSchema.extend({
  name: z.literal("checkout_initiated"),
  source: z.enum(["cart", "checkout_page"]),
  properties: checkoutSchema,
});

export const purchaseEventSchema = baseEventSchema.extend({
  name: z.literal("purchase"),
  source: z.literal("checkout_page"),
  properties: checkoutSchema.extend({
    checkout_mode: z.literal("fake_door"),
    payment_method: z.enum(["card", "express", "unknown"]),
  }),
});

export const configuratorStartedEventSchema = baseEventSchema.extend({
  name: z.literal("configurator_started"),
  source: z.literal("configurator"),
  properties: z.object({}),
});

export const configuratorFinishedEventSchema = baseEventSchema.extend({
  name: z.literal("configurator_finished"),
  source: z.literal("configurator"),
  properties: z.object({
    bed: z.enum(["single", "double"]),
    sleeping: z.enum(["alone", "together"]),
    size_id: z.string().trim().min(1).max(40),
  }),
});

export const trackingEventSchema = z.discriminatedUnion("name", [
  pageviewEventSchema,
  productViewedEventSchema,
  addToCartEventSchema,
  checkoutInitiatedEventSchema,
  purchaseEventSchema,
  configuratorStartedEventSchema,
  configuratorFinishedEventSchema,
]);

export type TrackingItem = z.infer<typeof trackingItemSchema>;
export type TrackingEvent = z.infer<typeof trackingEventSchema>;
export type TrackingEventName = TrackingEvent["name"];
export type TrackingEventOf<Name extends TrackingEventName> = Extract<
  TrackingEvent,
  { name: Name }
>;
export type TrackingProperties<Name extends TrackingEventName> =
  TrackingEventOf<Name>["properties"];
export type TrackingSource = TrackingEvent["source"];

type AdsProviderMapping = {
  posthog: string;
  meta:
    | "PageView"
    | "ViewContent"
    | "AddToCart"
    | "InitiateCheckout"
    | "Purchase";
  ga4:
    | "page_view"
    | "view_item"
    | "add_to_cart"
    | "begin_checkout"
    | "purchase";
  owner: "client" | "server";
  googleAds: "traffic" | "secondary" | "primary";
};

type PostHogOnlyProviderMapping = {
  posthog: string;
  meta: null;
  ga4: null;
  owner: "client";
  googleAds: null;
};

type ProviderMapping = AdsProviderMapping | PostHogOnlyProviderMapping;

export const TRACKING_EVENT_REGISTRY = {
  pageview: {
    posthog: "$pageview",
    meta: "PageView",
    ga4: "page_view",
    owner: "client",
    googleAds: "traffic",
  },
  product_viewed: {
    posthog: "product_viewed",
    meta: "ViewContent",
    ga4: "view_item",
    owner: "client",
    googleAds: "secondary",
  },
  add_to_cart: {
    posthog: "add_to_cart",
    meta: "AddToCart",
    ga4: "add_to_cart",
    owner: "client",
    googleAds: "secondary",
  },
  checkout_initiated: {
    posthog: "checkout_initiated",
    meta: "InitiateCheckout",
    ga4: "begin_checkout",
    owner: "client",
    googleAds: "secondary",
  },
  purchase: {
    posthog: "purchase",
    meta: "Purchase",
    ga4: "purchase",
    owner: "server",
    googleAds: "primary",
  },
  configurator_started: {
    posthog: "configurator_started",
    meta: null,
    ga4: null,
    owner: "client",
    googleAds: null,
  },
  configurator_finished: {
    posthog: "configurator_finished",
    meta: null,
    ga4: null,
    owner: "client",
    googleAds: null,
  },
} as const satisfies Record<TrackingEventName, ProviderMapping>;

export type PostHogOnlyEventName = Extract<
  TrackingEventName,
  "configurator_started" | "configurator_finished"
>;

export function isPostHogOnlyEventName(
  name: TrackingEventName,
): name is PostHogOnlyEventName {
  return TRACKING_EVENT_REGISTRY[name].meta === null;
}

export function parseTrackingEvent(value: unknown) {
  return trackingEventSchema.parse(value);
}
