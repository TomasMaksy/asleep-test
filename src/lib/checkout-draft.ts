import {
  type CheckoutCountryCode,
  checkoutConfig,
} from "@/lib/checkout-config";

export const CHECKOUT_DRAFT_KEY = "asleep.checkout.draft";

export type CheckoutDraft = {
  email: string;
  newsletter: boolean;
  country: CheckoutCountryCode;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  postal: string;
  city: string;
  phone: string;
  billingSame: boolean;
  billingCountry: CheckoutCountryCode;
  billingAddress: string;
  billingPostal: string;
  billingCity: string;
  discountCode: string;
  appliedDiscountCode: string;
};

function isCountry(value: unknown): value is CheckoutCountryCode {
  return checkoutConfig.countries.some((country) => country.code === value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function emptyCheckoutDraft(): CheckoutDraft {
  return {
    email: "",
    newsletter: true,
    country: checkoutConfig.defaultCountry,
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    postal: "",
    city: "",
    phone: "",
    billingSame: true,
    billingCountry: checkoutConfig.defaultCountry,
    billingAddress: "",
    billingPostal: "",
    billingCity: "",
    discountCode: "",
    appliedDiscountCode: "",
  };
}

export function readCheckoutDraft(): CheckoutDraft {
  const fallback = emptyCheckoutDraft();
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    return {
      email: asString(parsed.email),
      newsletter:
        typeof parsed.newsletter === "boolean"
          ? parsed.newsletter
          : fallback.newsletter,
      country: isCountry(parsed.country) ? parsed.country : fallback.country,
      firstName: asString(parsed.firstName),
      lastName: asString(parsed.lastName),
      address: asString(parsed.address),
      apartment: asString(parsed.apartment),
      postal: asString(parsed.postal),
      city: asString(parsed.city),
      phone: asString(parsed.phone),
      billingSame:
        typeof parsed.billingSame === "boolean"
          ? parsed.billingSame
          : fallback.billingSame,
      billingCountry: isCountry(parsed.billingCountry)
        ? parsed.billingCountry
        : fallback.billingCountry,
      billingAddress: asString(parsed.billingAddress),
      billingPostal: asString(parsed.billingPostal),
      billingCity: asString(parsed.billingCity),
      discountCode: asString(parsed.discountCode),
      appliedDiscountCode: asString(parsed.appliedDiscountCode),
    };
  } catch {
    return fallback;
  }
}

export function writeCheckoutDraft(patch: Partial<CheckoutDraft>) {
  if (typeof window === "undefined") {
    return;
  }

  const next = { ...readCheckoutDraft(), ...patch };
  sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(next));
}

export function clearCheckoutDraft() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
}
