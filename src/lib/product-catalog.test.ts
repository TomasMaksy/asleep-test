import { describe, expect, test } from "bun:test";
import { quoteCart } from "@/lib/product-catalog";
import {
  MATTRESS_SIZES,
  mattressSalePercent,
} from "@/lib/product-original-sizes";

describe("mattress sale catalog", () => {
  test("quotes the 45% sale price for every size", () => {
    for (const size of MATTRESS_SIZES) {
      const quoted = quoteCart([
        { id: `matt-original-${size.id}`, quantity: 1 },
      ]);
      expect(quoted?.items[0]?.price).toBe(size.plusCents / 100);
      expect(quoted?.value).toBe(size.plusCents / 100);
      expect(quoted?.compareValue).toBe(size.originalCents / 100);
      expect(mattressSalePercent(size)).toBe(45);
    }
  });
});
