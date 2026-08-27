"use client";

import { Minus, Plus, SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProductStickyBuyBar } from "@/app/[locale]/products/original/product-sticky-buy-bar";
import { AnimatedRadioIndicator } from "@/components/product/animated-radio-indicator";
import { ProductSizeSheet } from "@/components/product/product-size-sheet";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import {
  DEFAULT_MATTRESS_SIZE_ID,
  formatInstallmentPrice,
  formatMattPrice,
  getMattressSize,
  type MattressSizeId,
} from "@/lib/product-original-sizes";
import { cn } from "@/lib/utils";

type Variant = "plus" | "original";

export function ProductBuyBox() {
  const t = useTranslations("productOriginal.hero");
  const [variant, setVariant] = useState<Variant>("plus");
  const [quantity, setQuantity] = useState(1);
  const [sizeId, setSizeId] = useState<MattressSizeId>(
    DEFAULT_MATTRESS_SIZE_ID,
  );
  const [sizeOpen, setSizeOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);

  const size = getMattressSize(sizeId);
  const isPlus = variant === "plus";
  const compareCents = size.compareCents;
  const activeCents = isPlus ? size.plusCents : size.originalCents;
  const saveCents = compareCents - size.plusCents;
  const installmentPrice = formatInstallmentPrice(activeCents);

  function openSizeSheet() {
    closeCart();
    setSizeOpen(true);
  }

  function handleAddToCart() {
    const variantLabel = isPlus
      ? t("variants.plus.title")
      : t("variants.original.title");

    addItem(
      {
        id: `matt-original-${sizeId}-${variant}`,
        name: t("subtitle"),
        price: activeCents / 100,
        image: "/images/product-original-hero-lifestyle.webp",
        variant: `${size.label} · ${variantLabel}`,
      },
      quantity,
    );
    setSizeOpen(false);
    openCart();
  }

  return (
    <div className="flex flex-col">
      <div className="product-detail-content">
        <p>{t("description")}</p>
        <ul>
          {(t.raw("features") as string[]).map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex w-full items-center justify-between leading-[26px]">
          <span className="font-bold text-base text-brand-dark leading-[26px]">
            {t("sizeLabel")}
          </span>
          <span className="text-base text-brand-dark leading-[26px]">
            {t("heightLabel")}
          </span>
        </div>

        <button
          className="flex h-14 w-full cursor-pointer items-center justify-between rounded-full border border-grey bg-white py-0 pr-3 pl-6 text-left text-brand-dark text-rg"
          onClick={openSizeSheet}
          type="button"
        >
          {size.label}
          <ChevronRightIcon />
        </button>
      </div>

      <ProductSizeSheet
        isOpen={sizeOpen}
        onClose={() => setSizeOpen(false)}
        onSelect={setSizeId}
        selectedId={sizeId}
      />

      <fieldset className="mb-5 flex flex-wrap gap-3 border-0 p-0">
        <legend className="sr-only">Mattress type</legend>

        <VariantCard
          compareAtPrice={formatMattPrice(compareCents)}
          description={t("variants.plus.description")}
          onSelect={() => setVariant("plus")}
          price={formatMattPrice(size.plusCents)}
          save={t("saveLabel", { amount: formatMattPrice(saveCents) })}
          selected={isPlus}
          title={t("variants.plus.title")}
        />

        <VariantCard
          description={t("variants.original.description")}
          onSelect={() => setVariant("original")}
          price={formatMattPrice(size.originalCents)}
          selected={!isPlus}
          title={t("variants.original.title")}
        />
      </fieldset>

      <div className="mb-4 rounded-2xl border border-grey bg-surface p-4">
        <div className="mb-0 min-h-8">
          {isPlus ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-brand-dark/50 text-sm line-through md:text-base md:leading-none">
                {formatMattPrice(compareCents)}
              </span>
              <span className="font-bold text-brand-dark text-sm md:text-base md:leading-none">
                {formatMattPrice(activeCents)}
              </span>
              <span className="flex h-fit items-center justify-center whitespace-nowrap bg-red-600 px-2 font-bold text-sm text-white">
                {t("saveBadge")}
              </span>
            </div>
          ) : (
            <span className="font-bold text-brand-dark text-sm md:text-base md:leading-none">
              {formatMattPrice(activeCents)}
            </span>
          )}
        </div>

        <p className="mt-4 flex items-center gap-2 text-brand-dark text-sm">
          <StockIcon />
          {t("deliveryNote")}
        </p>

        <p className="mt-2 flex items-center gap-2 text-brand-dark text-sm">
          <KlarnaMark />
          <span>{t("installment", { price: installmentPrice })}</span>
          <InfoIcon />
        </p>

        <div className="mt-4 flex items-center gap-2">
          <QuantityStepper
            onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
            onIncrement={() => setQuantity((value) => value + 1)}
            quantity={quantity}
          />
          <button
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-brand px-6 font-normal text-base text-white transition-colors hover:bg-brand-dark"
            onClick={handleAddToCart}
            type="button"
          >
            {t("addToCart")}
          </button>
        </div>
      </div>

      <Link
        className="mb-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-brand bg-transparent font-normal text-base text-brand transition-colors hover:bg-brand-muted/30"
        href="/configurator"
      >
        <SquarePen className="size-4" strokeWidth={1.75} />
        {t("configurator")}
      </Link>

      <ProductStickyBuyBar
        activeCents={activeCents}
        compareCents={compareCents}
        isPlus={isPlus}
        observeId="product-info-slider"
        onAddToCart={handleAddToCart}
        onOpenSize={openSizeSheet}
        productName={
          isPlus ? t("stickyBar.plusName") : t("stickyBar.originalName")
        }
        sizeLabel={size.label}
      />
    </div>
  );
}

function VariantCard({
  title,
  description,
  price,
  compareAtPrice,
  save,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  price: string;
  compareAtPrice?: string;
  save?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex w-full cursor-pointer flex-col gap-2 rounded border p-4 pr-3 text-sm leading-normal transition-colors",
        selected
          ? "border-brand-dark bg-brand-muted"
          : "border-grey bg-white hover:border-[#c5cad8]",
      )}
    >
      <input
        checked={selected}
        className="peer sr-only"
        name="variant"
        onChange={onSelect}
        type="radio"
      />
      <span className="flex w-full gap-x-3">
        <span className="flex w-4 shrink-0 items-start">
          <AnimatedRadioIndicator selected={selected} size="sm" />
        </span>
        <span className="flex w-full min-w-0 flex-col gap-3">
          <span className="flex w-full gap-x-3">
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="font-bold text-brand-dark leading-[130%]">
                {title}
              </p>
              <p className="text-[#7c7c7c] leading-[130%] lg:whitespace-nowrap">
                {description}
              </p>
            </span>
            <span className="ml-auto flex shrink-0 flex-col items-end">
              {compareAtPrice ? (
                <>
                  <span className="text-sm leading-[16px] line-through opacity-50">
                    {compareAtPrice}
                  </span>
                  <span className="font-bold text-sm leading-[16px]">
                    {price}
                  </span>
                  {save ? (
                    <span className="mt-2 rounded bg-brand-dark px-2 py-1 font-bold text-[14px] text-white leading-[16px]">
                      {save}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="pb-1 font-bold text-sm leading-normal md:pb-0">
                  {price}
                </span>
              )}
            </span>
          </span>
        </span>
      </span>
      <div aria-hidden="true" className="flex flex-col gap-2" />
    </label>
  );
}

function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="inline-flex h-12 shrink-0 items-stretch overflow-hidden rounded-[24px] border border-grey bg-white">
      <button
        aria-label="Decrease quantity"
        className="flex size-12 cursor-pointer items-center justify-center text-brand disabled:opacity-20"
        onClick={onDecrement}
        type="button"
      >
        <Minus className="size-4" strokeWidth={2.25} />
      </button>
      <span className="flex min-w-8 items-center justify-center text-brand-dark text-sm">
        {quantity}
      </span>
      <button
        aria-label="Increase quantity"
        className="flex size-12 cursor-pointer items-center justify-center text-brand disabled:opacity-20"
        onClick={onIncrement}
        type="button"
      >
        <Plus className="size-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="ml-auto size-6 text-brand-dark"
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

function StockIcon() {
  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#3db56b] text-white">
      <svg
        aria-hidden="true"
        className="size-2.5"
        fill="none"
        viewBox="0 0 12 10"
      >
        <path
          d="M1 5.5L4.5 9L11 1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    </span>
  );
}

function KlarnaMark() {
  return (
    <span className="font-bold text-[#ffb3c7] text-base tracking-normal">
      Klarna.
    </span>
  );
}

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 text-brand-dark/45"
      fill="none"
      viewBox="0 0 14 14"
    >
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M7 6.25V10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.25"
      />
      <circle cx="7" cy="4.25" fill="currentColor" r="0.75" />
    </svg>
  );
}
