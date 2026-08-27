"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { selectCartCount, useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export function CartBagButton({
  className,
  solid = false,
  compactOnMobile = false,
}: {
  className?: string;
  solid?: boolean;
  compactOnMobile?: boolean;
}) {
  const t = useTranslations("cart");
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => selectCartCount(s.items));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const visibleCount = hydrated ? count : 0;
  const hasCount = visibleCount > 0;

  return (
    <button
      aria-label={t("open")}
      className={cn(
        "relative flex h-10 cursor-pointer items-center rounded-full border duration-150",
        solid
          ? "border-brand-dark/25"
          : "border-white/25 group-hover:border-brand-dark/25 group-data-[scrolled=true]:border-brand-dark/25",
        compactOnMobile
          ? "size-10 justify-center lg:h-10"
          : hasCount
            ? "gap-2 py-2 pr-2 pl-3"
            : "size-10 justify-center",
        compactOnMobile && hasCount && "lg:gap-2 lg:py-2 lg:pr-2 lg:pl-3 lg:w-auto",
        className,
      )}
      onClick={openCart}
      type="button"
    >
      <ShoppingBag className="size-[18px] shrink-0" strokeWidth={1.75} />
      {hasCount ? (
        <span
          aria-hidden="true"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-[#1A478A] font-bold text-sm text-white tabular-nums leading-none",
            compactOnMobile
              ? "absolute -top-1 -right-1 size-5 text-[11px] lg:static lg:top-auto lg:right-auto lg:text-sm"
              : null,
            !compactOnMobile && (visibleCount > 9 ? "h-6 min-w-6 px-1" : "size-6"),
            compactOnMobile &&
              (visibleCount > 9
                ? "lg:h-6 lg:min-w-6 lg:px-1"
                : "lg:size-6"),
          )}
        >
          {visibleCount > 99 ? "99+" : visibleCount}
        </span>
      ) : null}
    </button>
  );
}
