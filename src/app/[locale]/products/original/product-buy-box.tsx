"use client";

import { Minus, Plus, SquarePen } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProductStickyBuyBar } from "@/app/[locale]/products/original/product-sticky-buy-bar";
import { ConfiguratorLink } from "@/components/configurator/configurator-link";
import { ProductSizeSheet } from "@/components/product/product-size-sheet";
import { useCartStore } from "@/lib/cart-store";
import { useOriginalSizeStore } from "@/lib/product-original-size-store";
import {
  formatInstallmentPrice,
  formatMattPrice,
  getMattressSize,
  packshotSrc,
} from "@/lib/product-original-sizes";

export function ProductBuyBox() {
  const t = useTranslations("productOriginal.hero");
  const [quantity, setQuantity] = useState(1);
  const sizeId = useOriginalSizeStore((state) => state.sizeId);
  const setSizeId = useOriginalSizeStore((state) => state.setSizeId);
  const [sizeOpen, setSizeOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);

  const size = getMattressSize(sizeId);
  const activeCents = size.originalCents;
  const installmentPrice = formatInstallmentPrice(activeCents);

  function openSizeSheet() {
    closeCart();
    setSizeOpen(true);
  }

  function handleAddToCart() {
    addItem(
      {
        id: `matt-original-${sizeId}`,
        name: t("subtitle"),
        price: activeCents / 100,
        image: packshotSrc(sizeId),
        variant: size.label,
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

      <div className="mb-4 rounded-2xl border border-grey bg-surface p-4">
        <div className="mb-0 min-h-8">
          <span className="font-bold text-brand-dark text-sm md:text-base md:leading-none">
            {formatMattPrice(activeCents)}
          </span>
        </div>

        <p className="mt-4 flex items-center gap-2 text-brand-dark text-sm">
          <StockIcon />
          {t("deliveryNote")}
        </p>

        <p className="mt-2 flex items-center gap-2 text-brand-dark text-sm">
          <InbankMark />
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

      <ConfiguratorLink className="mb-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-brand bg-transparent font-normal text-base text-brand transition-colors hover:bg-brand-muted/30">
        <SquarePen className="size-4" strokeWidth={1.75} />
        {t("configurator")}
      </ConfiguratorLink>

      <ProductStickyBuyBar
        activeCents={activeCents}
        observeId="product-info-slider"
        onAddToCart={handleAddToCart}
        onOpenSize={openSizeSheet}
        packshotSrc={packshotSrc(sizeId)}
        productName={t("stickyBar.originalName")}
        sizeLabel={size.label}
      />
    </div>
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

function InbankMark() {
  return (
    <Image
      alt="Inbank"
      className="h-5 w-auto shrink-0 rounded-md"
      height={136}
      src="/images/payments/inbank.webp"
      width={300}
    />
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
