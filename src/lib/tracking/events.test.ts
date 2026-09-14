import { describe, expect, test } from "bun:test";
import {
  purchaseEventSchema,
  TRACKING_EVENT_REGISTRY,
  trackingEventSchema,
} from "@/lib/tracking/events";

const base = {
  event_id: "df03c65f-53e8-443f-bd61-d86baaf7674c",
  occurred_at: "2026-09-14T12:00:00.000Z",
  visitor_id: "e2f15c96-e14a-4e1a-bca6-fb9983f32de0",
  locale: "lt" as const,
  path: "/lt/checkout",
  url: "https://asleep.lt/lt/checkout",
};

const item = {
  item_id: "matt-original-80x190",
  item_name: "asleep Original",
  item_variant: "80 x 190 cm",
  price: 748,
  quantity: 1,
};

describe("tracking event contract", () => {
  test("maps every internal event to every provider", () => {
    expect(TRACKING_EVENT_REGISTRY).toEqual({
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
    });
  });

  test("accepts a complete fake-door purchase", () => {
    const result = purchaseEventSchema.parse({
      ...base,
      name: "purchase",
      source: "checkout_page",
      properties: {
        checkout_id: "22f3bcba-462b-4636-8569-5cc947f47d8a",
        checkout_mode: "fake_door",
        currency: "EUR",
        items: [item],
        payment_method: "card",
        value: 748,
      },
    });

    expect(result.properties.checkout_mode).toBe("fake_door");
    expect(result.properties.items[0]).toEqual(item);
  });

  test("allows pageviews without a referrer", () => {
    const result = trackingEventSchema.parse({
      ...base,
      name: "pageview",
      source: "route",
      properties: { page_title: "asleep Original" },
    });

    expect(result).toMatchObject({
      name: "pageview",
      properties: { page_title: "asleep Original" },
    });
  });

  test("rejects incomplete ecommerce and invalid ownership", () => {
    expect(
      trackingEventSchema.safeParse({
        ...base,
        name: "add_to_cart",
        source: "route",
        properties: { currency: "EUR", value: 748, items: [] },
      }).success,
    ).toBe(false);
  });
});
