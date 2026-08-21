"use client";

import type { ReactNode } from "react";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    variant?: string;
  };
  children: ReactNode;
  className?: string;
};

export function AddToCartButton({
  product,
  children,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  return (
    <button
      className={cn(
        "relative z-10 inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white px-6 font-sans text-[#1A478A] text-[0.875rem] leading-[1.8] tracking-normal transition-colors duration-300 hover:bg-brand-muted",
        className,
      )}
      onClick={() => {
        addItem(product);
        openCart();
      }}
      type="button"
    >
      {children}
    </button>
  );
}
