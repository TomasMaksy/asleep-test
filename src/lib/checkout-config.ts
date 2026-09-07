/**
 * Fake-door checkout — looks like Shopify Checkout.
 *
 * With `fakeDoor: true`, Pay Now never confirms a PaymentIntent. The lead is
 * saved and the customer goes to /checkout/thank-you. Apple Pay, Google Pay,
 * and Revolut stay visible so checkout looks real — they are not charged.
 *
 * Set fakeDoor to false when you are ready to take real (test or live) payments.
 * Live keys are refused until then.
 *
 * Copy: messages/{locale}/checkout.json
 */
export const checkoutConfig = {
  shopName: "Asleep",
  fakeDoor: true,
  currency: "EUR",
  moneyLocale: "lt-LT",
  defaultCountry: "LT",
  requirePhone: true,
  taxIncluded: true,
  taxRate: 0.21,
  showExpressCheckout: true,
  showDiscountCode: true,
  showBillingAddress: true,
  processingMs: 1100,
  theme: {
    buttonBackground: "#1a478a",
    buttonText: "#ffffff",
    accent: "#1a478a",
    pageBackground: "#ffffff",
    sidebarBackground: "#f5f5f5",
    text: "#2b2d41",
    muted: "#7c7c7c",
    border: "#e3e3e3",
    error: "#c23b3b",
    radius: "0.875rem",
  },
  countries: [
    { code: "LT", postal: /^(LT-?)?\d{5}$/i },
    { code: "LV", postal: /^(LV-?)?\d{4}$/i },
    { code: "EE", postal: /^\d{5}$/ },
  ],
  shippingMethods: [{ id: "standard", price: 0 }],
} as const;

export type CheckoutCountryCode =
  (typeof checkoutConfig.countries)[number]["code"];
export type CheckoutShippingId =
  (typeof checkoutConfig.shippingMethods)[number]["id"];

export function formatCheckoutMoney(
  amount: number,
  locale = checkoutConfig.moneyLocale,
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: checkoutConfig.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getShippingMethod(id: string) {
  return (
    checkoutConfig.shippingMethods.find((method) => method.id === id) ??
    checkoutConfig.shippingMethods[0]
  );
}

export function countryPostalRe(code: string) {
  return (
    checkoutConfig.countries.find((country) => country.code === code)?.postal ??
    /^.+$/
  );
}
