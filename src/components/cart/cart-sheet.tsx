"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";
import {
  formatEuro,
  selectCartCount,
  selectCartSubtotal,
  useCartStore,
} from "@/lib/cart-store";
import { CART } from "@/lib/copy";
import { cn } from "@/lib/utils";

const sheetTransition = {
  type: "tween" as const,
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 20 20">
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CartLineItem({
  id,
  name,
  price,
  image,
  variant,
  quantity,
}: {
  id: string;
  name: string;
  price: number;
  image: string;
  variant?: string;
  quantity: number;
}) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <li className="flex gap-4 border-brand-dark/10 border-b py-5">
      <div className="relative size-[88px] shrink-0 overflow-hidden rounded-2xl bg-surface">
        <Image
          alt=""
          className="object-contain p-2"
          fill
          sizes="88px"
          src={image}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-base text-brand-dark leading-snug">
              {name}
            </p>
            {variant ? (
              <p className="pt-0.5 text-brand-dark/55 text-rg">{variant}</p>
            ) : null}
          </div>
          <p className="shrink-0 font-medium text-brand-dark text-rg">
            {formatEuro(price * quantity)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="inline-flex h-9 items-center rounded-full border border-brand-dark/15">
            <button
              aria-label="Decrease quantity"
              className="flex size-9 cursor-pointer items-center justify-center text-brand-dark transition-opacity hover:opacity-60"
              onClick={() => setQuantity(id, quantity - 1)}
              type="button"
            >
              −
            </button>
            <span className="min-w-6 text-center text-rg tabular-nums">
              {quantity}
            </span>
            <button
              aria-label="Increase quantity"
              className="flex size-9 cursor-pointer items-center justify-center text-brand-dark transition-opacity hover:opacity-60"
              onClick={() => setQuantity(id, quantity + 1)}
              type="button"
            >
              +
            </button>
          </div>

          <button
            className="cursor-pointer text-brand-dark/50 text-rg underline transition-colors hover:text-brand-dark"
            onClick={() => removeItem(id)}
            type="button"
          >
            {CART.remove}
          </button>
        </div>
      </div>
    </li>
  );
}

export function CartSheet() {
  const reduceMotion = useReducedMotion();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const count = selectCartCount(items);
  const subtotal = selectCartSubtotal(items);
  const empty = items.length === 0;
  const duration = reduceMotion ? 0 : sheetTransition.duration;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[2000]" key="cart">
          <motion.button
            aria-label={CART.close}
            className="absolute inset-0 cursor-pointer bg-brand-dark/25 backdrop-blur-[6px] supports-[backdrop-filter]:bg-brand-dark/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            transition={{ duration, ease: sheetTransition.ease }}
            type="button"
          />

          <motion.aside
            aria-labelledby="cart-title"
            aria-modal="true"
            className={cn(
              "absolute inset-y-0 right-0 flex w-full flex-col bg-white text-brand-dark shadow-[-12px_0_40px_rgba(0,0,0,0.12)]",
              "md:w-[50%] lg:w-[min(40%,512px)]",
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            role="dialog"
            transition={{ duration, ease: sheetTransition.ease }}
          >
            <header className="flex h-20 shrink-0 items-center justify-between border-brand-dark/10 border-b px-5 md:px-8">
              <h2
                className="!text-[1.25rem] !leading-none !tracking-normal font-bold"
                id="cart-title"
              >
                {CART.title}
                {count > 0 ? (
                  <span className="ml-2 font-medium text-brand-dark/45 text-rg">
                    ({count})
                  </span>
                ) : null}
              </h2>
              <button
                aria-label={CART.close}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-dark/15 transition-colors hover:bg-surface"
                onClick={closeCart}
                type="button"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col">
              {empty ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                  <p className="font-bold text-lg">{CART.empty}</p>
                  <p className="max-w-[16rem] text-brand-dark/55 text-rg leading-relaxed">
                    {CART.emptyHint}
                  </p>
                  <button
                    className="mt-4 cursor-pointer font-medium text-[#1A478A] text-rg underline"
                    onClick={closeCart}
                    type="button"
                  >
                    {CART.continue}
                  </button>
                </div>
              ) : (
                <ul className="flex-1 overflow-y-auto overscroll-contain px-5 md:px-8">
                  {items.map((item) => (
                    <CartLineItem key={item.id} {...item} />
                  ))}
                </ul>
              )}
            </div>

            <footer className="shrink-0 border-brand-dark/10 border-t bg-white px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8">
              {!empty ? (
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="font-medium text-brand-dark/55 text-rg">
                    {CART.subtotal}
                  </span>
                  <span className="font-bold text-base tabular-nums">
                    {formatEuro(subtotal)}
                  </span>
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <button
                  className={cn(
                    "inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#1A478A] font-sans text-base text-white transition-colors duration-300",
                    empty
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-[#2B2D41]",
                  )}
                  disabled={empty}
                  type="button"
                >
                  {CART.checkout}
                </button>
                <button
                  className="cursor-pointer py-1 text-center text-brand-dark/50 text-rg underline transition-colors hover:text-brand-dark"
                  onClick={closeCart}
                  type="button"
                >
                  {CART.continue}
                </button>
              </div>
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
