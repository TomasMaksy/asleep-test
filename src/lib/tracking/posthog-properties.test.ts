import { describe, expect, test } from "bun:test";
import { purchaseEventSchema } from "@/lib/tracking/events";
import { posthogSharedProperties } from "@/lib/tracking/posthog-properties";

describe("PostHog product breakdown", () => {
  test("exposes size_id at the top level for a single-size cart", () => {
    const event = purchaseEventSchema.parse({
      event_id: "df03c65f-53e8-443f-bd61-d86baaf7674c",
      occurred_at: "2026-09-14T12:00:00.000Z",
      visitor_id: "e2f15c96-e14a-4e1a-bca6-fb9983f32de0",
      locale: "lt",
      path: "/checkout",
      url: "https://asleep.lt/checkout",
      source: "checkout_page",
      name: "purchase",
      properties: {
        checkout_id: "22f3bcba-462b-4636-8569-5cc947f47d8a",
        checkout_mode: "fake_door",
        currency: "EUR",
        items: [
          {
            item_id: "matt-original-160x200",
            item_name: "asleep Original",
            item_variant: "160 x 200 cm",
            size_id: "160x200",
            price: 748,
            quantity: 1,
          },
        ],
        payment_method: "card",
        value: 748,
      },
    });

    expect(posthogSharedProperties(event)).toMatchObject({
      size_id: "160x200",
      size_ids: ["160x200"],
      item_ids: ["matt-original-160x200"],
    });
  });
});
