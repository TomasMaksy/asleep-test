import type { CartItem } from "@/lib/cart-store";
import { resolveCatalogItem } from "@/lib/product-catalog";
import type { TrackingItem } from "@/lib/tracking/events";

export function cartToTrackingItems(
  items: CartItem[],
  coupon?: string,
): TrackingItem[] {
  const tracked: TrackingItem[] = [];

  for (const item of items) {
    const quoted = resolveCatalogItem(item.id, item.quantity, coupon);
    if (!quoted) {
      return [];
    }
    tracked.push(quoted);
  }

  return tracked;
}

export function trackingItemsValue(items: TrackingItem[]) {
  return (
    Math.round(
      items.reduce((total, item) => total + item.price * item.quantity, 0) *
        100,
    ) / 100
  );
}
