"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ProductSizeRadioList } from "@/components/product/product-size-radio-list";
import { SideSheet, SideSheetHeader } from "@/components/ui/side-sheet";
import {
  DOUBLE_MATTRESS_SIZES,
  isDoubleMattressSize,
  type MattressSizeId,
  SINGLE_MATTRESS_SIZES,
} from "@/lib/product-original-sizes";
import { cn } from "@/lib/utils";

type SizeCategory = "single" | "double";

type ProductSizeSheetProps = {
  isOpen: boolean;
  selectedId: MattressSizeId;
  onClose: () => void;
  onSelect: (id: MattressSizeId) => void;
};

export function ProductSizeSheet({
  isOpen,
  selectedId,
  onClose,
  onSelect,
}: ProductSizeSheetProps) {
  const t = useTranslations("productOriginal.hero");
  const [category, setCategory] = useState<SizeCategory>(
    isDoubleMattressSize(selectedId) ? "double" : "single",
  );

  useEffect(() => {
    if (isOpen) {
      setCategory(isDoubleMattressSize(selectedId) ? "double" : "single");
    }
  }, [isOpen, selectedId]);

  const sizes =
    category === "single" ? SINGLE_MATTRESS_SIZES : DOUBLE_MATTRESS_SIZES;

  return (
    <SideSheet
      closeLabel={t("sizeSheet.close")}
      labelledBy="product-size-sheet-title"
      onClose={onClose}
      open={isOpen}
    >
      <SideSheetHeader
        closeLabel={t("sizeSheet.close")}
        onClose={onClose}
        titleId="product-size-sheet-title"
      >
        {t("sizeLabel")}
      </SideSheetHeader>

      <div className="flex min-h-0 flex-1 flex-col px-5 md:px-8">
        <fieldset
          aria-label={`${t("sizeSheet.single")} / ${t("sizeSheet.double")}`}
          className="relative m-0 mt-6 flex min-w-0 rounded-full border border-brand-dark/10 p-1"
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              category === "double" && "translate-x-full",
            )}
          />
          <button
            aria-pressed={category === "single"}
            className={cn(
              "relative z-10 flex-1 rounded-full py-2.5 font-semibold text-sm transition-colors duration-300 motion-reduce:transition-none",
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
              "relative z-10 flex-1 rounded-full py-2.5 font-semibold text-sm transition-colors duration-300 motion-reduce:transition-none",
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
    </SideSheet>
  );
}
