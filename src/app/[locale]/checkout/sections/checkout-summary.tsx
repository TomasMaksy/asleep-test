"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { ChevronIcon } from "@/app/[locale]/checkout/sections/checkout-icons";
import { SaleBadge } from "@/components/product/sale-price";
import { useCartStore } from "@/lib/cart-store";
import { checkoutConfig, formatCheckoutMoney } from "@/lib/checkout-config";
import { useCheckoutDiscountStore } from "@/lib/checkout-discount";
import { readCheckoutDraft, writeCheckoutDraft } from "@/lib/checkout-draft";
import { quoteCart } from "@/lib/product-catalog";
import { cn } from "@/lib/utils";
import styles from "./checkout.module.css";

export function CheckoutSummary() {
  const t = useTranslations("checkoutPage.summary");
  const tShipping = useTranslations("checkoutPage.shipping");
  const tErrors = useTranslations("checkoutPage.errors");
  const items = useCartStore((state) => state.items);
  const applied = useCheckoutDiscountStore((state) => state.applied);
  const applyDiscountCode = useCheckoutDiscountStore((state) => state.apply);
  const quoted = quoteCart(
    items.map((item) => ({ id: item.id, quantity: item.quantity })),
    applied,
  );
  const compareTotal = quoted?.compareValue ?? 0;
  const discount = quoted?.discountValue ?? 0;
  const total = quoted?.value ?? 0;
  const taxAmount = checkoutConfig.taxIncluded
    ? total - total / (1 + checkoutConfig.taxRate)
    : 0;
  const [code, setCode] = useState(() => readCheckoutDraft().discountCode);
  const [discountError, setDiscountError] = useState("");
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    writeCheckoutDraft({ discountCode: code });
  }, [code]);

  function applyDiscount() {
    if (applyDiscountCode(code)) {
      setCode("");
      setDiscountError("");
      return;
    }
    setDiscountError(tErrors("discount"));
  }

  const shippingLabel = tShipping("free");

  const body = (
    <>
      <ul className="flex flex-col gap-4 pt-2">
        {items.map((item) => (
          <li className="flex items-start gap-4" key={item.id}>
            <div className="relative size-24 shrink-0">
              <div className="relative size-full overflow-hidden rounded-2xl bg-white">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  quality={90}
                  sizes="96px"
                  src={item.image}
                />
              </div>
              <span className={styles.badge}>{item.quantity}</span>
            </div>
            <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[17px] leading-snug">
                  {item.name.replaceAll("Asleep", "asleep")}
                </p>
                {item.variant ? (
                  <p className="pt-0.5 text-[15px] text-copy-muted">
                    {item.variant}
                  </p>
                ) : null}
                <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-brand leading-snug">
                  <StockCheckIcon />
                  {t("inStock")}
                </p>
              </div>
              <CheckoutLinePrice
                coupon={applied}
                fallback={item.price * item.quantity}
                id={item.id}
                quantity={item.quantity}
              />
            </div>
          </li>
        ))}
      </ul>

      {checkoutConfig.showDiscountCode ? (
        <div className={cn(styles.field, "mt-6")}>
          <label className={styles.label} htmlFor="checkout-discount">
            {t("discount")}
          </label>
          <div className="flex items-center gap-2">
            <input
              autoComplete="off"
              className={cn(
                styles.input,
                "min-w-0 flex-1",
                discountError && styles.inputError,
              )}
              id="checkout-discount"
              onChange={(event) => {
                setCode(event.target.value);
                if (discountError) {
                  setDiscountError("");
                }
              }}
              value={code}
            />
            <button
              className={styles.apply}
              disabled={!code.trim()}
              onClick={applyDiscount}
              type="button"
            >
              {t("apply")}
            </button>
          </div>
        </div>
      ) : null}
      {discountError ? <p className={styles.error}>{discountError}</p> : null}

      <dl className="mt-5 flex flex-col gap-2 text-[14px]">
        <div className="flex items-center justify-between">
          <dt>{t("subtotal")}</dt>
          <dd>{formatCheckoutMoney(compareTotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>{t("shipping")}</dt>
          <dd>{shippingLabel}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex items-center justify-between text-copy-muted">
            <dt>{t("discountLine")}</dt>
            <dd>−{formatCheckoutMoney(discount)}</dd>
          </div>
        ) : null}
        <div className="mt-2 flex items-end justify-between border-grey border-t pt-4">
          <dt className="font-semibold text-[16px]">{t("total")}</dt>
          <dd className="flex items-baseline gap-2">
            <span className="text-[12px] text-copy-muted">{t("currency")}</span>
            <span className="font-semibold text-[22px] tracking-tight">
              {formatCheckoutMoney(total)}
            </span>
          </dd>
        </div>
        {checkoutConfig.taxIncluded ? (
          <p className="text-right text-[12px] text-copy-muted">
            {t("taxIncluded", { amount: formatCheckoutMoney(taxAmount) })}
          </p>
        ) : null}
      </dl>
    </>
  );

  return (
    <>
      <div className={styles.mobileSummary}>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className={styles.mobileSummaryToggle}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <span className="flex items-center gap-2 text-brand">
            <span>{open ? t("hide") : t("show")}</span>
            <ChevronIcon
              className={cn(
                "size-3",
                styles.mobileSummaryChevron,
                open && styles.mobileSummaryChevronOpen,
              )}
            />
          </span>
          <span className="font-semibold text-[18px]">
            {formatCheckoutMoney(total)}
          </span>
        </button>
        <div
          className={cn(
            styles.mobileSummaryPanel,
            open && styles.mobileSummaryPanelOpen,
          )}
          id={panelId}
        >
          <div className={styles.mobileSummaryPanelInner} inert={!open}>
            <div className={styles.mobileSummaryBody}>{body}</div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">{body}</div>
    </>
  );
}

function CheckoutLinePrice({
  coupon,
  fallback,
  id,
  quantity,
}: {
  coupon?: string;
  fallback: number;
  id: string;
  quantity: number;
}) {
  const t = useTranslations("checkoutPage.summary");
  const line = quoteCart([{ id, quantity }], coupon);
  const sale = line?.value ?? fallback;
  const compare = line?.compareValue ?? sale;
  const save = line?.discountValue ?? 0;

  return (
    <div className="shrink-0 text-right">
      {save > 0 ? (
        <p
          aria-hidden="true"
          className="text-[13px] text-copy-muted line-through"
        >
          {formatCheckoutMoney(compare)}
        </p>
      ) : null}
      <p className="font-medium">{formatCheckoutMoney(sale)}</p>
      {save > 0 ? (
        <p className="mt-1">
          <SaleBadge>
            {t("saveAmount", { amount: formatCheckoutMoney(save) })}
          </SaleBadge>
        </p>
      ) : null}
    </div>
  );
}

function StockCheckIcon() {
  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-brand text-white">
      <Check className="size-2.5" strokeWidth={2.5} />
    </span>
  );
}
