"use client";

import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { warmCartSheet } from "@/components/cart/cart-sheet-warm";
import { SalePrice } from "@/components/product/sale-price";
import { formatMattPrice } from "@/lib/product-original-sizes";
import { staticImageUrl } from "@/lib/static-image-url";
import { cn } from "@/lib/utils";

const barTransition = {
  type: "tween" as const,
  duration: 0.38,
  ease: [0.32, 0.72, 0, 1] as const,
};

type ProductStickyBuyBarProps = {
  observeId: string;
  productName: string;
  sizeLabel: string;
  packshotSrc: string;
  activeCents: number;
  compareCents: number;
  saveBadge: string;
  onOpenSize: () => void;
  onAddToCart: () => void;
};

export function ProductStickyBuyBar({
  observeId,
  productName,
  sizeLabel,
  packshotSrc,
  activeCents,
  compareCents,
  saveBadge,
  onOpenSize,
  onAddToCart,
}: ProductStickyBuyBarProps) {
  const t = useTranslations("productOriginal.hero");
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const priceLabel = formatMattPrice(activeCents);

  useEffect(() => {
    const target = document.getElementById(observeId);
    if (!target) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const header = document.getElementById("site-header");
      const headerBottom = header?.getBoundingClientRect().bottom ?? 80;
      // Show once the buy box has scrolled under the header — not after the
      // next full-viewport sticky section has already taken over the screen.
      setVisible(target.getBoundingClientRect().bottom <= headerBottom + 1);
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [observeId]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ y: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[90]"
          exit={{ y: "100%" }}
          initial={{ y: "100%" }}
          key="product-sticky-buy-bar"
          transition={reduceMotion ? { duration: 0 } : barTransition}
        >
          <div
            className={cn(
              "pointer-events-auto border-grey border-t bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)]",
            )}
          >
            <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-2 px-4 sm:gap-4 md:h-20 md:gap-6 md:px-8 xl:px-10">
              <div className="hidden min-w-0 items-center gap-3 sm:flex">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    quality={90}
                    sizes="48px"
                    src={staticImageUrl(packshotSrc)}
                  />
                </div>
                <p className="truncate font-medium text-brand-dark text-sm md:text-base">
                  {productName}
                </p>
              </div>

              <button
                className="flex h-11 min-w-0 flex-[0.9] cursor-pointer items-center justify-between gap-2 rounded-full border border-grey bg-white py-0 pr-2 pl-4 text-brand-dark text-sm sm:w-auto sm:flex-none sm:justify-start md:h-12 md:pr-3 md:pl-5 md:text-base"
                onClick={onOpenSize}
                type="button"
              >
                <span className="truncate">{sizeLabel}</span>
                <ChevronRight
                  className="size-5 shrink-0 text-brand-dark"
                  strokeWidth={1.5}
                />
              </button>

              <button
                className="inline-flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full bg-brand px-3 font-normal text-sm text-white transition-colors hover:bg-brand-dark sm:hidden"
                onClick={onAddToCart}
                onFocus={warmCartSheet}
                onPointerEnter={warmCartSheet}
                type="button"
              >
                <span className="truncate">
                  {t("addToCart")} - {priceLabel}
                </span>
              </button>

              <div className="ml-auto hidden min-w-0 items-center gap-3 sm:flex md:gap-5">
                <SalePrice
                  badge={saveBadge}
                  compareCents={compareCents}
                  saleCents={activeCents}
                  saleClassName="text-sm md:text-lg"
                />

                <button
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand px-5 font-normal text-sm text-white transition-colors hover:bg-brand-dark md:h-12 md:px-7 md:text-base"
                  onClick={onAddToCart}
                  onFocus={warmCartSheet}
                  onPointerEnter={warmCartSheet}
                  type="button"
                >
                  {t("stickyBar.addToBasket")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
