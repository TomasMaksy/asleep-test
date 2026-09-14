import { quoteCart } from "@/lib/product-catalog";
import type { TrackingEventOf, TrackingItem } from "@/lib/tracking/events";

type QuotedEvent =
  | TrackingEventOf<"product_viewed">
  | TrackingEventOf<"add_to_cart">
  | TrackingEventOf<"checkout_initiated">;

export function withServerQuotedEcommerce(
  event: QuotedEvent,
): QuotedEvent | undefined {
  const quoted = quoteCart(
    event.properties.items.map((item: TrackingItem) => ({
      id: item.item_id,
      quantity: item.quantity,
    })),
    "coupon" in event.properties ? event.properties.coupon : undefined,
  );
  if (!quoted) {
    return undefined;
  }

  if (event.name === "checkout_initiated") {
    return {
      ...event,
      properties: {
        ...event.properties,
        items: quoted.items,
        value: quoted.value,
        coupon: quoted.coupon,
      },
    };
  }

  return {
    ...event,
    properties: {
      ...event.properties,
      items: quoted.items,
      value: quoted.value,
    },
  };
}
