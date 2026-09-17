"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { SideSheet, SideSheetHeader } from "@/components/ui/side-sheet";
import { Link } from "@/i18n/navigation";
import { formatEuro, selectCartCount, useCartStore } from "@/lib/cart-store";
import { useConfiguratorOverlayStore } from "@/lib/configurator-overlay-store";
import { cartLinePricing, quoteCart } from "@/lib/product-catalog";

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
  const t = useTranslations("cart");
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const pricing = cartLinePricing(id, quantity);
  const saleTotal = pricing?.sale ?? price * quantity;
  const compareTotal = pricing?.compare ?? saleTotal;

  return (
    <li className="flex gap-4 border-brand-dark/10 border-b py-5">
      <div className="relative size-[88px] shrink-0 overflow-hidden rounded-2xl bg-surface">
        <Image
          alt=""
          className="object-cover object-center"
          fill
          quality={90}
          sizes="88px"
          src={image}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-base text-brand-dark leading-snug">
              {name.replaceAll("Asleep", "asleep")}
            </p>
            {variant ? (
              <p className="pt-0.5 text-brand-dark/55 text-rg">{variant}</p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            {pricing?.onSale ? (
              <>
                <p
                  aria-hidden="true"
                  className="text-[#7c7c7c] text-sm line-through"
                >
                  {formatEuro(compareTotal)}
                </p>
                <p className="font-medium text-brand-dark text-rg">
                  {formatEuro(saleTotal)}
                </p>
              </>
            ) : (
              <p className="font-medium text-brand-dark text-rg">
                {formatEuro(saleTotal)}
              </p>
            )}
          </div>
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
            {t("remove")}
          </button>
        </div>
      </div>
    </li>
  );
}

export function CartSheet() {
  const t = useTranslations("cart");
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const count = selectCartCount(items);
  const quoted = quoteCart(
    items.map((item) => ({ id: item.id, quantity: item.quantity })),
  );
  const compareTotal = quoted?.compareValue ?? 0;
  const payableTotal = quoted?.value ?? 0;
  const discountTotal = quoted?.discountValue ?? 0;
  const empty = items.length === 0;

  return (
    <SideSheet
      closeLabel={t("close")}
      labelledBy="cart-title"
      onClose={closeCart}
      open={isOpen}
    >
      <SideSheetHeader
        closeLabel={t("close")}
        onClose={closeCart}
        titleId="cart-title"
      >
        {t("title")}
        {count > 0 ? (
          <span className="ml-2 font-medium text-brand-dark/45 text-rg">
            ({count})
          </span>
        ) : null}
      </SideSheetHeader>

      <div className="flex min-h-0 flex-1 flex-col">
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="font-bold text-lg">{t("empty")}</p>
            <p className="max-w-[16rem] text-brand-dark/55 text-rg leading-relaxed">
              {t("emptyHint")}
            </p>
            <button
              className="mt-4 cursor-pointer font-medium text-[#1A478A] text-rg underline"
              onClick={closeCart}
              type="button"
            >
              {t("continue")}
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
          <div className="mb-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-brand-dark/55 text-rg">
                {t("subtotal")}
              </span>
              <span className="text-rg tabular-nums">
                {formatEuro(compareTotal)}
              </span>
            </div>
            {discountTotal > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-brand-dark/55 text-rg">
                  {t("discount")}
                </span>
                <span className="text-rg tabular-nums">
                  −{formatEuro(discountTotal)}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-brand-dark/55 text-rg">
                {t("delivery")}
              </span>
              <span className="text-rg tabular-nums">{t("deliveryFree")}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="font-bold text-base">{t("total")}</span>
              <span className="font-bold text-base tabular-nums">
                {formatEuro(payableTotal)}
              </span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {empty ? (
            <button
              className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-[#1A478A] font-sans text-base text-white opacity-40"
              disabled
              type="button"
            >
              {t("checkout")}
            </button>
          ) : (
            <Link
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#1A478A] font-sans text-base text-white transition-colors duration-300 hover:bg-[#2B2D41]"
              href="/checkout"
              onClick={(event) => {
                closeCart();
                if (!useConfiguratorOverlayStore.getState().isOpen) {
                  return;
                }
                event.preventDefault();
                useConfiguratorOverlayStore.getState().setOpen(false);
                window.location.assign(
                  (event.currentTarget as HTMLAnchorElement).href,
                );
              }}
            >
              {t("checkout")}
            </Link>
          )}
          <button
            className="cursor-pointer py-1 text-center text-brand-dark/50 text-rg underline transition-colors hover:text-brand-dark"
            onClick={closeCart}
            type="button"
          >
            {t("continue")}
          </button>
        </div>
      </footer>
    </SideSheet>
  );
}
