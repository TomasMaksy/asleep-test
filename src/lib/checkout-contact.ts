export type CheckoutContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export const CHECKOUT_THANKS_KEY = "asleep.checkout.thanks";

export function splitCheckoutName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0] ?? "", lastName: parts[0] ?? "" };
  }
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function storeCheckoutThanks(contact: CheckoutContact) {
  sessionStorage.setItem(CHECKOUT_THANKS_KEY, JSON.stringify(contact));
}

export function readCheckoutThanks(): CheckoutContact | null {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_THANKS_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CheckoutContact>;
    if (typeof parsed.email !== "string") {
      return null;
    }
    return {
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : "",
      email: parsed.email,
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
    };
  } catch {
    return null;
  }
}
