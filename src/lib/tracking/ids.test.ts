import { describe, expect, test } from "bun:test";
import {
  CHECKOUT_ID_KEY,
  claimCheckoutInitiated,
  completeCheckout,
  getOrCreateStoredId,
  getVisitorId,
  type TrackingStorage,
  VISITOR_ID_KEY,
} from "@/lib/tracking/ids";

class MemoryStorage implements TrackingStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("tracking identifiers", () => {
  test("persists the generated identifier", () => {
    const storage = new MemoryStorage();
    let sequence = 0;
    const create = () => `id-${++sequence}`;

    expect(getOrCreateStoredId(storage, "visitor", create)).toBe("id-1");
    expect(getOrCreateStoredId(storage, "visitor", create)).toBe("id-1");
    expect(sequence).toBe(1);
  });

  test("replaces stored visitor identifiers that are not UUIDs", () => {
    const original = globalThis.localStorage;
    const storage = new MemoryStorage();
    storage.setItem(VISITOR_ID_KEY, "not-a-uuid");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });

    try {
      expect(getVisitorId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(storage.getItem(VISITOR_ID_KEY)).toBe(getVisitorId());
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: original,
      });
    }
  });

  test("claims checkout initiation only once per checkout", () => {
    const storage = new MemoryStorage();

    expect(claimCheckoutInitiated("checkout-1", storage)).toBe(true);
    expect(claimCheckoutInitiated("checkout-1", storage)).toBe(false);
    expect(claimCheckoutInitiated("checkout-2", storage)).toBe(true);
    expect(
      claimCheckoutInitiated("checkout-1", storage, "matt-original-80x190:1"),
    ).toBe(true);
    expect(
      claimCheckoutInitiated("checkout-1", storage, "matt-original-80x190:1"),
    ).toBe(false);
  });

  test("completion clears only the matching checkout", () => {
    const storage = new MemoryStorage();
    storage.setItem(CHECKOUT_ID_KEY, "checkout-1");
    claimCheckoutInitiated("checkout-1", storage);

    completeCheckout("checkout-1", storage);

    expect(storage.getItem(CHECKOUT_ID_KEY)).toBeNull();
    expect(claimCheckoutInitiated("checkout-1", storage)).toBe(true);
  });
});
