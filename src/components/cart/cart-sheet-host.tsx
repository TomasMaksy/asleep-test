"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

const CartSheet = dynamic(
  () =>
    import("@/components/cart/cart-sheet").then((module) => module.CartSheet),
  { ssr: false },
);

/** Defer cart/motion bundle until first open or idle time. */
export function CartSheetHost() {
  const isOpen = useCartStore((s) => s.isOpen);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReady(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (ready) {
      return;
    }

    const warm = () => setReady(true);
    let idleId = 0;
    const timeoutId = window.setTimeout(warm, 3500);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(warm, { timeout: 5000 });
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
