import { describe, expect, test } from "bun:test";
import { buildGa4EventParams } from "@/lib/tracking/client/ga4";
import { buildMetaPixelData } from "@/lib/tracking/client/meta";
import { purchaseEventSchema } from "@/lib/tracking/events";
import { buildGa4MeasurementPayload } from "@/lib/tracking/server/ga4";
import { buildMetaServerEvent } from "@/lib/tracking/server/meta";

const purchase = purchaseEventSchema.parse({
  event_id: "df03c65f-53e8-443f-bd61-d86baaf7674c",
  occurred_at: "2026-09-14T12:00:00.000Z",
  visitor_id: "e2f15c96-e14a-4e1a-bca6-fb9983f32de0",
  locale: "lt",
  path: "/lt/checkout",
  url: "https://asleep.lt/lt/checkout",
  source: "checkout_page",
  posthog_session_id: "01994a32-bf9f-7000-8000-000000000001",
  ga_client_id: "123456789.987654321",
  ga_session_id: "1789387200",
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

describe("provider payloads", () => {
  test("keeps Meta browser and server data on one event ID", () => {
    const pixel = buildMetaPixelData(purchase);
    const capi = buildMetaServerEvent(
      purchase,
      {
        clientIp: "203.0.113.1",
        userAgent: "Example Browser",
        fbp: "fb.1.123.456",
      },
      {
        email: "Customer@Example.com",
        phone: "+370 600 00000",
        firstName: "Customer",
        lastName: "Example",
        country: "LT",
      },
    );

    expect(capi.event_name).toBe("Purchase");
    expect(capi.event_id).toBe(purchase.event_id);
    expect(capi.custom_data).toEqual(pixel);
    expect(JSON.stringify(capi.user_data)).not.toContain(
      "Customer@Example.com",
    );
    expect(JSON.stringify(capi.user_data)).not.toContain("37060000000");
  });

  test("normalizes local Lithuanian numbers to the same E.164 hash", () => {
    const international = buildMetaServerEvent(
      purchase,
      {},
      {
        phone: "+370 600 00000",
        country: "LT",
      },
    );
    const local = buildMetaServerEvent(
      purchase,
      {},
      {
        phone: "860000000",
        country: "LT",
      },
    );
    expect(international.user_data.ph).toEqual(local.user_data.ph);
  });

  test("keeps GA4 browser and server purchases on one transaction ID", () => {
    const web = buildGa4EventParams(purchase);
    const measurement = buildGa4MeasurementPayload(purchase);
    const serverParams = measurement.events[0]?.params;
    const webTransactionId =
      "transaction_id" in web ? web.transaction_id : undefined;

    expect(webTransactionId).toBe(purchase.properties.checkout_id);
    expect(serverParams?.transaction_id).toBe(purchase.properties.checkout_id);
    expect(measurement.client_id).toBe(purchase.ga_client_id);
    expect(typeof measurement.timestamp_micros).toBe("number");
    expect(serverParams?.session_id).toBe(purchase.ga_session_id);
    expect(serverParams?.items).toEqual(purchase.properties.items);
    expect(serverParams).not.toHaveProperty("engagement_time_msec");
  });

  test("maps every funnel event onto the same Meta event ID", () => {
    expect(buildMetaServerEvent(purchase, {}).event_id).toBe(purchase.event_id);
  });
});
