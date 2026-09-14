import type { CartItem } from "@/lib/cart-store";
import type { TrackingItem } from "@/lib/tracking/events";

export function cartItemToTrackingItem(item: CartItem): TrackingItem {
  return {
    item_id: item.id,
    item_name: item.name,
    item_variant: item.variant ?? "",
    price: item.price,
    quantity: item.quantity,
  };
}

export function cartToTrackingItems(items: CartItem[]) {
  return items.map(cartItemToTrackingItem);
}
