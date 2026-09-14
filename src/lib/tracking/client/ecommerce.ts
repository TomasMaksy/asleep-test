import type { CartItem } from "@/lib/cart-store";
import { resolveCatalogItem } from "@/lib/product-catalog";
import { cartToTrackingItems, trackingItemsValue } from "@/lib/tracking/cart";
import {
  createTrackingEvent,
  trackClientEvent,
} from "@/lib/tracking/client/dispatcher";
import { getGoogleIdentifiers } from "@/lib/tracking/client/ga4";
import type {
  TrackingEventOf,
  TrackingItem,
  TrackingSource,
} from "@/lib/tracking/events";
import { claimCheckoutInitiated, getCheckoutId } from "@/lib/tracking/ids";
import { logTrackingIssue } from "@/lib/tracking/log";

export function trackProductViewed(sizeId: string) {
  const item = resolveCatalogItem(`matt-original-${sizeId}`, 1);
  if (!item) {
    return;
  }

  return trackClientEvent(
    "product_viewed",
    {
      currency: "EUR",
      value: item.price * item.quantity,
      items: [item],
    },
    { source: "route" },
  );
}

export function trackAddedCartItems(
  items: CartItem[],
  source: Extract<
    TrackingSource,
    "pdp_buy_box" | "pdp_sticky_bar" | "configurator"
  >,
) {
  const tracked = cartToTrackingItems(items);
  if (tracked.length === 0) {
    return;
  }

  return trackClientEvent(
    "add_to_cart",
    {
      currency: "EUR",
      value: trackingItemsValue(tracked),
      items: tracked,
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

  const tracked = cartToTrackingItems(items);
  if (tracked.length === 0) {
    logTrackingIssue({
      eventName: "checkout_initiated",
      reason: "catalog_mismatch",
    });
    return;
  }

  const checkoutId = getCheckoutId();
  const signature = checkoutCartSignature(tracked);
  if (!claimCheckoutInitiated(checkoutId, sessionStorage, signature)) {
    logTrackingIssue(
      {
        eventName: "checkout_initiated",
        reason: "already_claimed",
      },
      { once: `checkout-initiated-${checkoutId}-${signature}` },
    );
    return;
  }

  void getGoogleIdentifiers();
  return trackClientEvent(
    "checkout_initiated",
    {
      checkout_id: checkoutId,
      currency: "EUR",
      value: trackingItemsValue(tracked),
      items: tracked,
    },
    { source, immediate: source === "cart" },
  );
}

function checkoutCartSignature(items: TrackingItem[]) {
  return items
    .map((item) => `${item.item_id}:${item.quantity}`)
    .sort()
    .join(",");
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
  const tracked = cartToTrackingItems(items, coupon);
  if (tracked.length === 0) {
    throw new Error("Purchase items are not in the catalog.");
  }

  const google = await getGoogleIdentifiers();

  return createTrackingEvent(
    "purchase",
    {
      checkout_id: getCheckoutId(),
      checkout_mode: "fake_door",
      coupon: coupon || undefined,
      currency: "EUR",
      items: tracked,
      payment_method: paymentMethod,
      value,
    },
    { source: "checkout_page", google },
  );
}
