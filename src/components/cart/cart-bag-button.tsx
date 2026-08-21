"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { selectCartCount, useCartStore } from "@/lib/cart-store";
import { CART } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function CartBagButton({ className }: { className?: string }) {
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => selectCartCount(s.items));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const visibleCount = hydrated ? count : 0;

  return (
    <button
      aria-label={CART.open}
      className={cn(
        "relative flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/25 duration-150",
        "group-hover:border-brand-dark/25 group-data-[scrolled=true]:border-brand-dark/25",
        visibleCount > 0 && "md:w-[4.8rem] md:justify-start md:gap-2 md:px-3",
        className,
      )}
      onClick={openCart}
      type="button"
    >
      <ShoppingBag className="size-4 shrink-0" strokeWidth={1.75} />
      {visibleCount > 0 ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1A478A] px-1 font-bold text-[10px] text-white leading-none",
            "md:static md:h-5 md:min-w-5 md:text-[11px]",
          )}
        >
          {visibleCount > 99 ? "99+" : visibleCount}
        </span>
      ) : null}
    </button>
  );
}
