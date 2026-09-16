"use client";

import {
  Check,
  ChevronRight,
  Info,
  Minus,
  Plus,
  SquarePen,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProductStickyBuyBar } from "@/app/[locale]/products/original/product-sticky-buy-bar";
import { ConfiguratorLink } from "@/components/configurator/configurator-link";
import { ProductSizeSheet } from "@/components/product/product-size-sheet";
import { SalePrice } from "@/components/product/sale-price";
import { useCartStore } from "@/lib/cart-store";
import { useOriginalSizeStore } from "@/lib/product-original-size-store";
import {
  formatInstallmentPrice,
  getMattressSize,
  mattressCompareCents,
  mattressSaleCents,
  packshotSrc,
} from "@/lib/product-original-sizes";
import { trackAddedCartItems } from "@/lib/tracking/client/ecommerce";

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
  const activeCents = mattressSaleCents(size);
  const compareCents = mattressCompareCents(size);
  const installmentPrice = formatInstallmentPrice(activeCents);

  function openSizeSheet() {
    closeCart();
    setSizeOpen(true);
  }

  function handleAddToCart(source: "pdp_buy_box" | "pdp_sticky_bar") {
    const product = {
      id: `matt-original-${sizeId}`,
      name: t("subtitle"),
      price: activeCents / 100,
      image: packshotSrc(sizeId),
      variant: size.label,
    };
    addItem(product, quantity);
    trackAddedCartItems([{ ...product, quantity }], source);
    setSizeOpen(false);
    openCart();
  }

  return (
    <div className="flex flex-col" id="product-buy-box">
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
          <ChevronRight
            className="ml-auto size-6 text-brand-dark"
            strokeWidth={1.5}
          />
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
          <SalePrice
            badge={t("saveBadge")}
            compareCents={compareCents}
            saleCents={activeCents}
            saleClassName="text-sm md:text-xl md:leading-none"
          />
        </div>

        <p className="mt-4 flex items-center gap-2 text-brand-dark text-sm">
          <StockIcon />
          {t("deliveryNote")}
        </p>

        <p className="mt-2 flex items-center gap-2 text-brand-dark text-sm">
          <InbankMark />
          <span>{t("installment", { price: installmentPrice })}</span>
          <Info className="size-3.5 text-brand-dark/45" strokeWidth={1.75} />
        </p>

        <div className="mt-4 flex items-center gap-2">
          <QuantityStepper
            onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
            onIncrement={() => setQuantity((value) => value + 1)}
            quantity={quantity}
          />
          <button
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-brand px-6 font-normal text-base text-white transition-colors hover:bg-brand-dark"
            onClick={() => handleAddToCart("pdp_buy_box")}
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
        compareCents={compareCents}
        observeId="product-buy-box"
        saveBadge={t("saveBadge")}
        onAddToCart={() => handleAddToCart("pdp_sticky_bar")}
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

function StockIcon() {
  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#3db56b] text-white">
      <Check className="size-2.5" strokeWidth={2.5} />
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
