"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
  isPlus: boolean;
  compareCents: number;
  activeCents: number;
  onOpenSize: () => void;
  onAddToCart: () => void;
};

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 text-brand-dark"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ProductStickyBuyBar({
  observeId,
  productName,
  sizeLabel,
  isPlus,
  compareCents,
  activeCents,
  onOpenSize,
  onAddToCart,
}: ProductStickyBuyBarProps) {
  const t = useTranslations("productOriginal.hero");
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

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
      setVisible(target.getBoundingClientRect().top <= headerBottom + 1);
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
            <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-4 px-4 md:h-20 md:gap-6 md:px-8 xl:px-10">
              <div className="hidden min-w-0 items-center gap-3 sm:flex">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="48px"
                    src={staticImageUrl("/images/product-gallery/packshot.jpg")}
                  />
                </div>
                <p className="truncate font-medium text-brand-dark text-sm md:text-base">
                  {productName}
                </p>
              </div>

              <button
                className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-grey bg-white py-0 pr-2 pl-4 text-brand-dark text-sm md:h-12 md:pr-3 md:pl-5 md:text-base"
                onClick={onOpenSize}
                type="button"
              >
                <span className="whitespace-nowrap">{sizeLabel}</span>
                <ChevronRightIcon />
              </button>

              <div className="ml-auto flex min-w-0 items-center gap-3 md:gap-5">
                <div className="hidden items-center gap-2 sm:flex">
                  {isPlus ? (
                    <>
                      <span className="text-brand-dark/45 text-sm line-through md:text-base">
                        {formatMattPrice(compareCents)}
                      </span>
                      <span className="font-bold text-base text-brand-dark md:text-lg">
                        {formatMattPrice(activeCents)}
                      </span>
                      <span className="rounded bg-red-600 px-2 py-0.5 font-bold text-[12px] text-white md:text-sm">
                        {t("saveBadge")}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-base text-brand-dark md:text-lg">
                      {formatMattPrice(activeCents)}
                    </span>
                  )}
                </div>

                <span className="font-bold text-brand-dark text-sm sm:hidden">
                  {formatMattPrice(activeCents)}
                </span>

                <button
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand px-5 font-normal text-sm text-white transition-colors hover:bg-brand-dark md:h-12 md:px-7 md:text-base"
                  onClick={onAddToCart}
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
