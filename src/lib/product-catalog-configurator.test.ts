import { describe, expect, test } from "bun:test";
import {
  catalogProductId,
  configuratorCartProductId,
  resolveCatalogItem,
} from "@/lib/product-catalog";
import { MATTRESS_SIZES } from "@/lib/product-original-sizes";
import { cartToTrackingItems } from "@/lib/tracking/cart";

describe("configurator cart product ids", () => {
  test("resolves every size with alone and together firmness suffixes", () => {
    for (const size of MATTRESS_SIZES) {
      for (const you of [1, 2, 3, 4, 5, 6] as const) {
        const aloneId = configuratorCartProductId(size.id, you);
        const alone = resolveCatalogItem(aloneId, 1);
        expect(alone?.item_id).toBe(catalogProductId(size.id));
        expect(alone?.size_id).toBe(size.id);

        for (const partner of [1, 2, 3] as const) {
          const togetherId = configuratorCartProductId(size.id, you, partner);
          const together = resolveCatalogItem(togetherId, 1);
          expect(together?.item_id).toBe(catalogProductId(size.id));
          expect(together?.size_id).toBe(size.id);
        }
      }
    }
  });

  test("cartToTrackingItems accepts configurator ATC lines", () => {
    const id = configuratorCartProductId("160x200", 3, 5);
    const tracked = cartToTrackingItems([
      {
        id,
        name: "asleep Original",
        price: 1,
        image: "/images/x.webp",
        variant: "test",
        quantity: 1,
      },
    ]);
    expect(tracked).toHaveLength(1);
    expect(tracked[0]?.item_id).toBe("matt-original-160x200");
  });

  test("cartToTrackingItems returns empty for unknown ids", () => {
    const tracked = cartToTrackingItems([
      {
        id: "totally-fake-sku",
        name: "nope",
        price: 1,
        image: "/images/x.webp",
        quantity: 1,
      },
    ]);
    expect(tracked).toEqual([]);
  });
});
