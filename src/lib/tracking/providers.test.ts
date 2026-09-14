import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { buildGa4EventParams } from "@/lib/tracking/client/ga4";
import { buildMetaPixelData } from "@/lib/tracking/client/meta";
import { purchaseEventSchema } from "@/lib/tracking/events";
import { buildGa4MeasurementUserData } from "@/lib/tracking/ga4-user-data";
import {
  buildMetaPixelUserData,
  hashMetaExternalId,
  normalizeMetaCity,
  normalizeMetaEmail,
  normalizeMetaPostal,
  normalizeMetaText,
} from "@/lib/tracking/meta-user-data";
import { normalizePhoneE164 } from "@/lib/tracking/phone";
import {
  buildGa4MeasurementPayload,
  GA4_MEASUREMENT_ENGAGEMENT_TIME_MSEC,
  ga4CollectUrl,
  ga4ValidationUrl,
} from "@/lib/tracking/server/ga4";
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
    const contact = {
      email: "Customer@Example.com",
      phone: "+370 600 00000",
      firstName: "Customer",
      lastName: "Example",
      country: "LT",
    };
    const capi = buildMetaServerEvent(
      purchase,
      {
        clientIp: "203.0.113.1",
        userAgent: "Example Browser",
        fbp: "fb.1.123.456",
      },
      contact,
    );

    expect(capi.event_name).toBe("Purchase");
    expect(capi.event_id).toBe(purchase.event_id);
    expect(capi.custom_data).toEqual(pixel);
    expect(JSON.stringify(capi.user_data)).not.toContain(
      "Customer@Example.com",
    );
    expect(JSON.stringify(capi.user_data)).not.toContain("37060000000");
  });

  test("sends the same Advanced Matching set on Pixel and CAPI", async () => {
    const contact = {
      email: "Customer@Example.com",
      phone: "+370 600 00000",
      firstName: "Customer",
      lastName: "Example",
      city: "Vilnius",
      postal: "LT-01100",
      country: "LT",
    };
    const hashedExternalId = await hashMetaExternalId(purchase.visitor_id);
    const pixelUser = buildMetaPixelUserData(contact, hashedExternalId);
    const capi = buildMetaServerEvent(purchase, {}, contact);

    expect(pixelUser).toEqual({
      em: "customer@example.com",
      ph: "37060000000",
      fn: "customer",
      ln: "example",
      ct: "vilnius",
      zp: "lt01100",
      country: "lt",
      external_id: hashedExternalId,
    });
    expect(capi.user_data.em).toEqual([sha256(pixelUser.em)]);
    expect(capi.user_data.ph).toEqual([sha256(pixelUser.ph)]);
    expect(capi.user_data.fn).toEqual([sha256(pixelUser.fn)]);
    expect(capi.user_data.ln).toEqual([sha256(pixelUser.ln)]);
    expect(capi.user_data.ct).toEqual([sha256(pixelUser.ct)]);
    expect(capi.user_data.zp).toEqual([sha256(pixelUser.zp)]);
    expect(capi.user_data.country).toEqual([sha256(pixelUser.country)]);
    expect(capi.user_data.external_id).toEqual([pixelUser.external_id]);
    expect(normalizeMetaEmail(contact.email)).toBe(pixelUser.em);
    expect(normalizePhoneE164(contact.phone, contact.country)).toBe(
      pixelUser.ph,
    );
    expect(normalizeMetaCity(contact.city)).toBe(pixelUser.ct);
    expect(normalizeMetaPostal(contact.postal)).toBe(pixelUser.zp);
    expect(normalizeMetaText(contact.country)).toBe(pixelUser.country);
  });

  test("omits client_ip_address when it is not an IP", () => {
    const invalid = buildMetaServerEvent(purchase, { clientIp: "unknown" });
    const valid = buildMetaServerEvent(purchase, { clientIp: "203.0.113.1" });

    expect(invalid.user_data).not.toHaveProperty("client_ip_address");
    expect(valid.user_data.client_ip_address).toBe("203.0.113.1");
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
    const measurement = buildGa4MeasurementPayload(purchase, {
      debugMode: false,
    });
    const serverParams = measurement.events[0]?.params;
    const webTransactionId =
      "transaction_id" in web ? web.transaction_id : undefined;

    expect(webTransactionId).toBe(purchase.properties.checkout_id);
    expect(serverParams?.transaction_id).toBe(purchase.properties.checkout_id);
    expect(measurement.client_id).toBe(purchase.ga_client_id);
    expect(typeof measurement.timestamp_micros).toBe("number");
    expect(serverParams?.session_id).toBe(Number(purchase.ga_session_id));
    expect(typeof serverParams?.session_id).toBe("number");
    expect(String(serverParams?.session_id)).toMatch(/^\d+$/);
    expect(serverParams?.items).toEqual(purchase.properties.items);
    expect(serverParams?.engagement_time_msec).toBe(
      GA4_MEASUREMENT_ENGAGEMENT_TIME_MSEC,
    );
    expect(serverParams).not.toHaveProperty("debug_mode");
    expect(measurement).not.toHaveProperty("user_data");
  });

  test("omits Measurement Protocol session_id when it is not a digit string", () => {
    const measurement = buildGa4MeasurementPayload(purchase, {
      sessionId: "session",
      debugMode: false,
    });

    expect(measurement.events[0]?.params).not.toHaveProperty("session_id");
  });

  test("sends hashed enhanced conversions on Measurement Protocol purchase", async () => {
    const userData = await buildGa4MeasurementUserData({
      email: "Customer@Example.com",
      phone: "+370 600 00000",
      firstName: "Customer",
      lastName: "Example",
      city: "Vilnius",
      postal: "LT-01100",
      country: "LT",
    });
    const measurement = buildGa4MeasurementPayload(purchase, {
      userData,
      debugMode: false,
    });

    expect(measurement.user_id).toBe(purchase.visitor_id);
    expect(measurement.user_data?.sha256_email_address).toBe(
      sha256("customer@example.com"),
    );
    expect(measurement.user_data?.sha256_phone_number).toBe(
      sha256("+37060000000"),
    );
    expect(JSON.stringify(measurement.user_data)).not.toContain(
      "Customer@Example.com",
    );
  });

  test("ingests Measurement Protocol events instead of only validating them", () => {
    expect(ga4CollectUrl().hostname).toBe("region1.google-analytics.com");
    expect(ga4CollectUrl().pathname).toBe("/mp/collect");
    expect(ga4ValidationUrl().pathname).toBe("/debug/mp/collect");
    expect(
      buildGa4MeasurementPayload(purchase, { debugMode: true }).events[0]
        ?.params,
    ).toMatchObject({ debug_mode: true });
  });

  test("maps every funnel event onto the same Meta event ID", () => {
    expect(buildMetaServerEvent(purchase, {}).event_id).toBe(purchase.event_id);
  });
});

function sha256(value: string | undefined) {
  expect(value).toBeTruthy();
  return createHash("sha256")
    .update(value ?? "")
    .digest("hex");
}
