import type { CartItem } from "@/lib/cart-store";
import { logTrackingIssue } from "@/lib/tracking/log";

export type CatalogAlertPayload = {
  eventName: "add_to_cart" | "checkout_initiated" | "purchase";
  source: string;
  cartIds: string[];
  path?: string;
  url?: string;
  reason: "catalog_mismatch";
};

const reported = new Set<string>();

function alertSignature(payload: CatalogAlertPayload) {
  return `${payload.eventName}:${payload.source}:${payload.cartIds.slice().sort().join(",")}`;
}

/** Client-side: console warn + one network alert per signature per page session. */
export function reportCatalogMismatch(input: {
  eventName: CatalogAlertPayload["eventName"];
  source: string;
  items: CartItem[];
}) {
  const cartIds = input.items.map((item) => `${item.id}x${item.quantity}`);
  const payload: CatalogAlertPayload = {
    eventName: input.eventName,
    source: input.source,
    cartIds,
    path:
      typeof window !== "undefined" ? window.location.pathname : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    reason: "catalog_mismatch",
  };

  logTrackingIssue({
    eventName: payload.eventName,
    reason: "catalog_mismatch",
  });

  if (process.env.NODE_ENV === "development") {
    console.error(
      "[tracking] catalog_mismatch — ecommerce event dropped",
      payload,
    );
  }

  const signature = alertSignature(payload);
  if (reported.has(signature)) {
    return;
  }
  reported.add(signature);

  if (typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(
        "/api/tracking/catalog-alert",
        new Blob([body], { type: "application/json" }),
      );
      if (ok) {
        return;
      }
    }
    void fetch("/api/tracking/catalog-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Alerting must never break checkout.
    });
  } catch {
    // Alerting must never break checkout.
  }
}

export function resetCatalogAlertReportsForTests() {
  reported.clear();
}
