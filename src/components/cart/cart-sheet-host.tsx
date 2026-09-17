"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  subscribeCartSheetWarm,
  warmCartSheet,
} from "@/components/cart/cart-sheet-warm";
import { useCartStore } from "@/lib/cart-store";

const CartSheet = dynamic(
  () =>
    import("@/components/cart/cart-sheet").then((module) => module.CartSheet),
  { ssr: false },
);

/**
 * Defer cart sheet JS until first open, bag hover/focus, or idle time.
 * Keeps cart off the critical path for LCP while avoiding open lag.
 */
export function CartSheetHost() {
  const isOpen = useCartStore((s) => s.isOpen);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReady(true);
    }
  }, [isOpen]);

  useEffect(() => subscribeCartSheetWarm(() => setReady(true)), []);

  useEffect(() => {
    if (ready) {
      return;
    }

    const warm = () => {
      warmCartSheet();
    };
    let idleId = 0;
    const timeoutId = window.setTimeout(warm, 2500);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(warm, { timeout: 4000 });
    }

    return () => {
      window.clearTimeout(timeoutId);
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [ready]);

  if (!ready) {
    return null;
  }

  return <CartSheet />;
}
