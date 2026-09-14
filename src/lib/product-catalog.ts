import { acceptedDiscountCode, discountedCents } from "@/lib/checkout-codes";
import {
  getMattressSize,
  MATTRESS_SIZES,
  type MattressSizeId,
} from "@/lib/product-original-sizes";
import type { TrackingItem } from "@/lib/tracking/events";

const ORIGINAL_ITEM_ID_RE = /^matt-original-(\d+x\d+)(?:-c[1-6](?:p[1-6])?)?$/;
const CATALOG_ITEM_NAME = "asleep Original";
const MAX_LINE_QUANTITY = 10;
const MAX_LINES = 20;

export type CartSelection = {
  id: string;
  quantity: number;
};

export type QuotedCart = {
  items: TrackingItem[];
  value: number;
  coupon?: string;
};

export function quoteCart(
  selections: CartSelection[],
  coupon?: string,
): QuotedCart | undefined {
  if (selections.length === 0 || selections.length > MAX_LINES) {
    return undefined;
  }

  const acceptedCoupon = acceptedDiscountCode(coupon);
  const items: TrackingItem[] = [];
  let value = 0;

  for (const selection of selections) {
    const item = resolveCatalogItem(
      selection.id,
      selection.quantity,
      acceptedCoupon,
    );
    if (!item) {
      return undefined;
    }
    items.push(item);
    value += item.price * item.quantity;
  }

  return {
    items,
    value: Math.round(value * 100) / 100,
    coupon: acceptedCoupon,
  };
}

export function resolveCatalogItem(
  id: string,
  quantity: number,
  coupon?: string,
): TrackingItem | undefined {
  const qty = Math.floor(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_LINE_QUANTITY) {
    return undefined;
  }

  const match = ORIGINAL_ITEM_ID_RE.exec(id.trim());
  const sizeId = match?.[1];
  if (!sizeId || !isMattressSizeId(sizeId)) {
    return undefined;
  }

  const size = getMattressSize(sizeId);
  const unitCents = coupon
    ? discountedCents(size.originalCents, coupon)
    : size.originalCents;
  const discountCents = size.originalCents - unitCents;
  const price = unitCents / 100;

  return {
    item_id: id.trim(),
    item_name: CATALOG_ITEM_NAME,
    item_variant: size.label,
    price,
    quantity: qty,
    ...(discountCents > 0 ? { discount: discountCents / 100 } : {}),
  };
}

function isMattressSizeId(value: string): value is MattressSizeId {
  return MATTRESS_SIZES.some((entry) => entry.id === value);
}
