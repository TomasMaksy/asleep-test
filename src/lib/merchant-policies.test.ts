import { describe, expect, test } from "bun:test";
import {
  buildMerchantReturnPolicy,
  buildOfferShippingDetails,
  buildOrganizationShippingService,
  MERCHANT_RETURN_DAYS,
  MERCHANT_SHIPPING_COUNTRIES,
  MERCHANT_TRANSIT_DAYS,
} from "@/lib/merchant-policies";

describe("merchant-policies", () => {
  test("ships free to checkout countries with the FAQ delivery window", () => {
    expect(MERCHANT_SHIPPING_COUNTRIES).toEqual(["LT", "LV", "EE"]);
    expect(MERCHANT_RETURN_DAYS).toBe(120);
    expect(MERCHANT_TRANSIT_DAYS).toEqual({ min: 5, max: 8 });

    const details = buildOfferShippingDetails("https://asleep.lt");
    expect(details).toHaveLength(3);
    expect(details[0]?.shippingRate.value).toBe(0);
    expect(details[0]?.deliveryTime.transitTime.minValue).toBe(5);
    expect(details[0]?.deliveryTime.transitTime.maxValue).toBe(8);
  });

  test("return policy matches the 120-night free trial", () => {
    const policy = buildMerchantReturnPolicy("https://asleep.lt");
    expect(policy["@id"]).toBe("https://asleep.lt/#return-policy");
    expect(policy.merchantReturnDays).toBe(120);
    expect(policy.returnFees).toBe("https://schema.org/FreeReturn");
    expect(policy.applicableCountry).toEqual(["LT", "LV", "EE"]);
  });

  test("organization shipping covers Baltics from LT", () => {
    const service = buildOrganizationShippingService();
    expect(service.shippingConditions).toHaveLength(3);
    expect(service.shippingConditions[0]?.shippingOrigin.addressCountry).toBe(
      "LT",
    );
    expect(service.shippingConditions[0]?.shippingRate.value).toBe("0");
  });
});
