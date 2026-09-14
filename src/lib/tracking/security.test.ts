import { describe, expect, test } from "bun:test";
import { quoteCart } from "@/lib/product-catalog";
import {
  claimOnce,
  resetIdempotencyForTests,
} from "@/lib/tracking/server/idempotency";
import {
  isAllowedOrigin,
  isTrustedSiteRequest,
} from "@/lib/tracking/server/origins";
import { isWithinReplayWindow } from "@/lib/tracking/server/replay";

const productionEnv = {
  NODE_ENV: "production",
  NEXT_PUBLIC_SITE_URL: "https://asleep.lt",
} as NodeJS.ProcessEnv;

describe("trusted site origins", () => {
  test("rejects requests with no Origin or Referer", () => {
    expect(
      isTrustedSiteRequest(
        new Request("https://asleep.lt/api/tracking", { method: "POST" }),
      ),
    ).toBe(false);
  });

  test("allows asleep.lt and rejects other sites in production", () => {
    expect(isAllowedOrigin("https://asleep.lt", productionEnv)).toBe(true);
    expect(isAllowedOrigin("https://www.asleep.lt", productionEnv)).toBe(true);
    expect(isAllowedOrigin("https://evil.example", productionEnv)).toBe(false);
    expect(isAllowedOrigin("https://untrusted.example", productionEnv)).toBe(
      false,
    );
    expect(isAllowedOrigin("http://localhost:3000", productionEnv)).toBe(false);
  });

  test("allows localhost and the reserved tunnel host only outside production", () => {
    const developmentEnv = {
      NODE_ENV: "development",
      NEXT_PUBLIC_SITE_URL: "https://asleep.lt",
      NEXT_PUBLIC_BASE_HOST: "example.ngrok-free.dev",
    } as NodeJS.ProcessEnv;

    expect(isAllowedOrigin("http://localhost:3000", developmentEnv)).toBe(true);
    expect(
      isAllowedOrigin("https://example.ngrok-free.dev", developmentEnv),
    ).toBe(true);
    expect(
      isAllowedOrigin("https://other-tunnel.ngrok-free.dev", developmentEnv),
    ).toBe(false);
    expect(isAllowedOrigin("https://untrusted.example", developmentEnv)).toBe(
      false,
    );
    expect(
      isAllowedOrigin("https://example.ngrok-free.dev", productionEnv),
    ).toBe(false);
  });
});

describe("catalog quotes", () => {
  test("uses server prices and ignores client amounts", () => {
    const quoted = quoteCart(
      [{ id: "matt-original-80x190", quantity: 1 }],
      undefined,
    );
    expect(quoted?.value).toBe(748);
    expect(quoted?.items[0]?.price).toBe(748);
    expect(quoted?.items[0]?.size_id).toBe("80x190");
    expect(quoted?.items[0]?.item_id).toBe("matt-original-80x190");
  });

  test("maps configurator cart ids onto the size SKU", () => {
    const quoted = quoteCart(
      [{ id: "matt-original-160x200-c3p5", quantity: 1 }],
      undefined,
    );
    expect(quoted?.items[0]?.item_id).toBe("matt-original-160x200");
    expect(quoted?.items[0]?.size_id).toBe("160x200");
    expect(quoted?.items[0]?.item_variant).toBe("160 x 200 cm");
  });

  test("rejects unknown products and applies known discounts", () => {
    expect(quoteCart([{ id: "totally-fake", quantity: 1 }])).toBeUndefined();
    const quoted = quoteCart(
      [{ id: "matt-original-80x190", quantity: 1 }],
      "LUCKY99",
    );
    expect(quoted?.coupon).toBe("LUCKY99");
    expect(quoted?.items[0]?.price).toBe(0.75);
    expect(quoted?.items[0]?.discount).toBe(747.25);
    expect(quoted?.value).toBe(0.75);
    expect(
      quoted?.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    ).toBe(quoted?.value);
  });
});

describe("replay and idempotency", () => {
  test("accepts recent timestamps and rejects stale ones", () => {
    const now = Date.parse("2026-09-14T12:00:00.000Z");
    expect(isWithinReplayWindow("2026-09-14T11:55:00.000Z", now)).toBe(true);
    expect(isWithinReplayWindow("2026-09-14T11:00:00.000Z", now)).toBe(false);
  });

  test("claims an event id only once", () => {
    resetIdempotencyForTests();
    expect(claimOnce("event:test")).toBe(true);
    expect(claimOnce("event:test")).toBe(false);
  });
});
