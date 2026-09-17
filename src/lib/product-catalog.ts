import { acceptedDiscountCode, discountedCents } from "@/lib/checkout-codes";
import {
  getMattressSize,
  MATTRESS_SIZES,
  type MattressSizeId,
  mattressCompareCents,
  mattressSaleCents,
} from "@/lib/product-original-sizes";
import type { TrackingItem } from "@/lib/tracking/events";

const ORIGINAL_ITEM_ID_RE = /^matt-original-(\d+x\d+)/;
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
  compareValue: number;
  discountValue: number;
  coupon?: string;
};

export type CartLinePricing = {
  sale: number;
  compare: number;
  save: number;
  onSale: boolean;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

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
  let compareValue = 0;

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
    if (!isMattressSizeId(item.size_id)) {
      return undefined;
    }
    const size = getMattressSize(item.size_id);
    compareValue += (mattressCompareCents(size) / 100) * item.quantity;
  }

  const roundedValue = roundMoney(value);
  const roundedCompare = roundMoney(compareValue);

  return {
    items,
    value: roundedValue,
    compareValue: roundedCompare,
    discountValue: roundMoney(roundedCompare - roundedValue),
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
  const compareCents = mattressCompareCents(size);
  const saleCents = mattressSaleCents(size);
  const unitCents = coupon ? discountedCents(saleCents, coupon) : saleCents;
  const discountCents = compareCents - unitCents;
  const price = unitCents / 100;

  return {
    item_id: catalogProductId(sizeId),
    item_name: CATALOG_ITEM_NAME,
    item_variant: size.label,
    size_id: sizeId,
    price,
    quantity: qty,
    ...(discountCents > 0 ? { discount: discountCents / 100 } : {}),
  };
}

export function cartLinePricing(
  id: string,
  quantity: number,
): CartLinePricing | undefined {
  const item = resolveCatalogItem(id, quantity);
  if (!item || !isMattressSizeId(item.size_id)) {
    return undefined;
  }

  const size = getMattressSize(item.size_id);
  const compare = roundMoney((mattressCompareCents(size) / 100) * quantity);
  const sale = roundMoney(item.price * item.quantity);

  return {
    sale,
    compare,
    save: roundMoney(compare - sale),
    onSale: sale < compare,
  };
}

export function catalogProductId(sizeId: string) {
  return `matt-original-${sizeId}`;
}

/** Cart line id for configurator ATC. Catalog regex still resolves the size SKU. */
export function configuratorCartProductId(
  sizeId: MattressSizeId,
  you: number,
  partner?: number,
) {
  const base = catalogProductId(sizeId);
  if (partner != null) {
    return `${base}-c${you}p${partner}`;
  }
  return `${base}-c${you}`;
}

function isMattressSizeId(value: string): value is MattressSizeId {
  return MATTRESS_SIZES.some((entry) => entry.id === value);
}
