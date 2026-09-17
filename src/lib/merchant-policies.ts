import { checkoutConfig } from "@/lib/checkout-config";

/** Destinations we ship to (checkout countries). */
export const MERCHANT_SHIPPING_COUNTRIES = checkoutConfig.countries.map(
  (country) => country.code,
);

/** 120-night trial from product FAQ / hero copy. */
export const MERCHANT_RETURN_DAYS = 120;

/** Standard delivery window from PDP delivery note (business days). */
export const MERCHANT_TRANSIT_DAYS = { min: 5, max: 8 } as const;

const currency = checkoutConfig.currency;

export function merchantReturnPolicyId(siteUrl: string) {
  return `${siteUrl}/#return-policy`;
}

export function merchantShippingPolicyId(siteUrl: string, country: string) {
  return `${siteUrl}/#shipping-${country.toLowerCase()}`;
}

/** Offer-level return policy (merchant listings). */
export function buildMerchantReturnPolicy(siteUrl: string) {
  return {
    "@type": "MerchantReturnPolicy" as const,
    "@id": merchantReturnPolicyId(siteUrl),
    applicableCountry: [...MERCHANT_SHIPPING_COUNTRIES],
    returnPolicyCountry: "LT",
    returnPolicyCategory:
      "https://schema.org/MerchantReturnFiniteReturnWindow" as const,
    merchantReturnDays: MERCHANT_RETURN_DAYS,
    returnMethod: "https://schema.org/ReturnByMail" as const,
    returnFees: "https://schema.org/FreeReturn" as const,
    refundType: "https://schema.org/FullRefund" as const,
  };
}

/** One OfferShippingDetails per destination country (free standard delivery). */
export function buildOfferShippingDetails(siteUrl: string) {
  return MERCHANT_SHIPPING_COUNTRIES.map((country) => ({
    "@type": "OfferShippingDetails" as const,
    "@id": merchantShippingPolicyId(siteUrl, country),
    shippingRate: {
      "@type": "MonetaryAmount" as const,
      value: 0,
      currency,
    },
    shippingDestination: {
      "@type": "DefinedRegion" as const,
      addressCountry: country,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime" as const,
      handlingTime: {
        "@type": "QuantitativeValue" as const,
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue" as const,
        minValue: MERCHANT_TRANSIT_DAYS.min,
        maxValue: MERCHANT_TRANSIT_DAYS.max,
        unitCode: "DAY",
      },
    },
  }));
}

/** Organization-level shipping service (OnlineStore). */
export function buildOrganizationShippingService() {
  return {
    "@type": "ShippingService" as const,
    name: "Standard delivery",
    description: "Free home delivery in 5–8 business days across the Baltics.",
    fulfillmentType: "https://schema.org/FulfillmentTypeDelivery" as const,
    shippingConditions: MERCHANT_SHIPPING_COUNTRIES.map((country) => ({
      "@type": "ShippingConditions" as const,
      shippingOrigin: {
        "@type": "DefinedRegion" as const,
        addressCountry: "LT",
      },
      shippingDestination: {
        "@type": "DefinedRegion" as const,
        addressCountry: country,
      },
      shippingRate: {
        "@type": "MonetaryAmount" as const,
        value: "0",
        currency,
      },
    })),
  };
}
