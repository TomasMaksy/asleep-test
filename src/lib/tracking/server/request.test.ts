import { describe, expect, test } from "bun:test";
import { purchaseEventSchema } from "@/lib/tracking/events";
import { getTrackingRequestContext } from "@/lib/tracking/server/request";

const purchase = purchaseEventSchema.parse({
  event_id: "df03c65f-53e8-443f-bd61-d86baaf7674c",
  occurred_at: "2026-09-14T12:00:00.000Z",
  visitor_id: "e2f15c96-e14a-4e1a-bca6-fb9983f32de0",
  locale: "lt",
  path: "/checkout",
  url: "https://asleep.lt/checkout?fbclid=FromUrl",
  source: "checkout_page",
  fbp: "fb.1.1.event",
  fbc: "fb.1.1.event",
  name: "purchase",
  properties: {
    checkout_id: "22f3bcba-462b-4636-8569-5cc947f47d8a",
    checkout_mode: "fake_door",
    currency: "EUR",
    items: [
      {
        item_id: "matt-original-80x190",
        item_name: "asleep Original",
        item_variant: "80 x 190 cm",
        size_id: "80x190",
        price: 748,
        quantity: 1,
      },
    ],
    payment_method: "card",
    value: 748,
  },
});

describe("tracking request context", () => {
  test("prefers Pixel cookies over asleep copies", () => {
    const context = getTrackingRequestContext(
      new Request("https://asleep.lt/api/checkout", {
        headers: {
          cookie:
            "_fbp=fb.1.2.pixel; asleep_fbp=fb.1.1.asleep; _fbc=fb.1.2.pixel; asleep_fbc=fb.1.1.asleep",
          "x-forwarded-for": "203.0.113.9",
        },
      }),
      purchase,
    );

    expect(context.fbp).toBe("fb.1.2.pixel");
    expect(context.fbc).toBe("fb.1.2.pixel");
    expect(context.clientIp).toBe("203.0.113.9");
  });

  test("falls back to GA cookies when the purchase event has no client id", () => {
    const context = getTrackingRequestContext(
      new Request("https://asleep.lt/api/checkout", {
        headers: {
          cookie: "_ga=GA1.1.123456789.987654321",
        },
      }),
      purchase,
    );

    expect(context.gaClientId).toBe("123456789.987654321");
  });

  test("omits client_ip_address when the header is not an IP", () => {
    const context = getTrackingRequestContext(
      new Request("https://asleep.lt/api/checkout", {
        headers: { "x-forwarded-for": "unknown" },
      }),
      purchase,
    );

    expect(context.clientIp).toBeUndefined();
  });
});
