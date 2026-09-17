import { describe, expect, test } from "bun:test";
import { asHttpUrl, sanitizeTrackingUrl } from "@/lib/tracking/urls";

describe("tracking urls", () => {
  test("strips Stripe return parameters without dropping other query values", () => {
    expect(
      sanitizeTrackingUrl(
        "https://asleep.lt/checkout/thank-you?payment_intent=pi_test&payment_intent_client_secret=secret&redirect_status=succeeded&utm_source=stripe",
      ),
    ).toBe("https://asleep.lt/checkout/thank-you?utm_source=stripe");
  });

  test("keeps only http(s) referrers", () => {
    expect(asHttpUrl("https://asleep.lt/")).toBe("https://asleep.lt/");
    expect(asHttpUrl("javascript:alert(1)")).toBeUndefined();
  });
});
