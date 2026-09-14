import type { CartItem } from "@/lib/cart-store";
import { selectCartSubtotal } from "@/lib/cart-store";
import { cartToTrackingItems } from "@/lib/tracking/cart";
import {
  createTrackingEvent,
  trackClientEvent,
} from "@/lib/tracking/client/dispatcher";
import { getGoogleIdentifiers } from "@/lib/tracking/client/ga4";
import type { TrackingEventOf, TrackingSource } from "@/lib/tracking/events";
import { claimCheckoutInitiated, getCheckoutId } from "@/lib/tracking/ids";

export function trackAddedCartItems(
  items: CartItem[],
  source: Extract<
    TrackingSource,
    "pdp_buy_box" | "pdp_sticky_bar" | "configurator"
  >,
) {
  if (items.length === 0) {
    return;
  }

  return trackClientEvent(
    "add_to_cart",
    {
      currency: "EUR",
      value: selectCartSubtotal(items),
      items: cartToTrackingItems(items),
    },
    { source },
  );
}

export function trackCheckoutInitiated(
  items: CartItem[],
  source: Extract<TrackingSource, "cart" | "checkout_page">,
) {
  if (items.length === 0) {
    return;
  }

  const checkoutId = getCheckoutId();
  if (!claimCheckoutInitiated(checkoutId)) {
    return;
  }

  void getGoogleIdentifiers();
  return trackClientEvent(
    "checkout_initiated",
    {
      checkout_id: checkoutId,
      currency: "EUR",
      value: selectCartSubtotal(items),
      items: cartToTrackingItems(items),
    },
    { source, immediate: source === "cart" },
  );
}

export async function createPurchaseTrackingEvent({
  items,
  value,
  coupon,
  paymentMethod,
}: {
  items: CartItem[];
  value: number;
  coupon?: string;
  paymentMethod: "card" | "express" | "unknown";
}): Promise<TrackingEventOf<"purchase">> {
  const google = await getGoogleIdentifiers();

  return createTrackingEvent(
    "purchase",
    {
      checkout_id: getCheckoutId(),
      checkout_mode: "fake_door",
      coupon: coupon || undefined,
      currency: "EUR",
      items: cartToTrackingItems(items),
      payment_method: paymentMethod,
      value,
    },
    { source: "checkout_page", google },
  );
}
