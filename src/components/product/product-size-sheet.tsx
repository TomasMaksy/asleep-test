"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ProductSizeRadioList } from "@/components/product/product-size-radio-list";
import {
  DOUBLE_MATTRESS_SIZES,
  isDoubleMattressSize,
  type MattressSizeId,
  SINGLE_MATTRESS_SIZES,
} from "@/lib/product-original-sizes";
import { cn } from "@/lib/utils";

const sheetTransition = {
  type: "tween" as const,
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

type SizeCategory = "single" | "double";

type ProductSizeSheetProps = {
  isOpen: boolean;
  selectedId: MattressSizeId;
  onClose: () => void;
  onSelect: (id: MattressSizeId) => void;
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

export function ProductSizeSheet({
  isOpen,
  selectedId,
  onClose,
  onSelect,
}: ProductSizeSheetProps) {
  const t = useTranslations("productOriginal.hero");
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : sheetTransition.duration;
  const [category, setCategory] = useState<SizeCategory>(
    isDoubleMattressSize(selectedId) ? "double" : "single",
  );

  useEffect(() => {
    if (isOpen) {
      setCategory(isDoubleMattressSize(selectedId) ? "double" : "single");
    }
  }, [isOpen, selectedId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const sizes =
    category === "single" ? SINGLE_MATTRESS_SIZES : DOUBLE_MATTRESS_SIZES;

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[2000]" key="product-size-sheet">
          <motion.button
            aria-label={t("sizeSheet.close")}
            className="absolute inset-0 cursor-pointer bg-brand-dark/25 backdrop-blur-[6px] supports-[backdrop-filter]:bg-brand-dark/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration, ease: sheetTransition.ease }}
            type="button"
          />

          <motion.aside
            aria-labelledby="product-size-sheet-title"
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
                id="product-size-sheet-title"
              >
                {t("sizeLabel")}
              </h2>
              <button
                aria-label={t("sizeSheet.close")}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-dark/15 transition-colors hover:bg-surface"
                onClick={onClose}
                type="button"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col px-5 md:px-8">
              <fieldset
                aria-label={`${t("sizeSheet.single")} / ${t("sizeSheet.double")}`}
                className="relative m-0 mt-6 flex min-w-0 rounded-full border border-brand-dark/10 p-1"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand",
                    reduceMotion
                      ? ""
                      : "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    category === "double" && "translate-x-full",
                  )}
                />
                <button
                  aria-pressed={category === "single"}
                  className={cn(
                    "relative z-10 flex-1 rounded-full py-2.5 font-semibold text-sm",
                    reduceMotion ? "" : "transition-colors duration-300",
                    category === "single"
                      ? "text-white"
                      : "text-brand-dark hover:text-brand-dark/70",
                  )}
                  onClick={() => setCategory("single")}
                  type="button"
                >
                  {t("sizeSheet.single")}
                </button>
                <button
                  aria-pressed={category === "double"}
                  className={cn(
                    "relative z-10 flex-1 rounded-full py-2.5 font-semibold text-sm",
                    reduceMotion ? "" : "transition-colors duration-300",
                    category === "double"
                      ? "text-white"
                      : "text-brand-dark hover:text-brand-dark/70",
                  )}
                  onClick={() => setCategory("double")}
                  type="button"
                >
                  {t("sizeSheet.double")}
                </button>
              </fieldset>

              <p className="mt-4 text-brand-dark/70 text-sm leading-relaxed">
                {t("sizeSheet.slackHint")}
              </p>

              <div className="mt-2 flex-1 overflow-y-auto overscroll-contain">
                <ProductSizeRadioList
                  onSelect={onSelect}
                  onSelectionSettled={onClose}
                  selectedId={selectedId}
                  sizes={sizes}
                />
              </div>

              <div className="shrink-0 py-6">
                <button
                  className="font-medium text-brand text-sm underline-offset-2 hover:underline"
                  onClick={() =>
                    setCategory((current) =>
                      current === "single" ? "double" : "single",
                    )
                  }
                  type="button"
                >
                  {category === "single"
                    ? `${t("sizeSheet.viewDoubleSizes")} →`
                    : `${t("sizeSheet.viewSingleSizes")} →`}
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
