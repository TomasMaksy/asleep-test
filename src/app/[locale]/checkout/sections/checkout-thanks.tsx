"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { selectCartSubtotal, useCartStore } from "@/lib/cart-store";
import { checkoutConfig } from "@/lib/checkout-config";
import {
  type CheckoutContact,
  readCheckoutThanks,
  storeCheckoutThanks,
} from "@/lib/checkout-contact";
import { voidPayment } from "@/lib/checkout-stripe-flow";
import { cn } from "@/lib/utils";
import styles from "./checkout.module.css";

export function CheckoutThanksSection() {
  const t = useTranslations("checkoutPage.thanks");
  const tFooter = useTranslations("checkoutPage.footer");
  const locale = useLocale();
  const clearCart = useCartStore((state) => state.clearCart);
  const [contact, setContact] = useState<CheckoutContact | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readCheckoutThanks();
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent");
    const status = params.get("redirect_status");

    if (!paymentIntentId || status !== "succeeded") {
      setContact(stored);
      setReady(true);
      if (stored && !checkoutConfig.fakeDoor) {
        clearCart();
      }
      return;
    }

    const cartItems = useCartStore.getState().items;

    void (async () => {
      try {
        const next = await voidPayment(paymentIntentId, {
          email: stored?.email,
          name: `${stored?.firstName ?? ""} ${stored?.lastName ?? ""}`.trim(),
          phone: stored?.phone,
        });
        const merged: CheckoutContact = {
          firstName: next.firstName || stored?.firstName || "",
          lastName: next.lastName || stored?.lastName || "",
          email: next.email || stored?.email || "",
          phone: next.phone || stored?.phone || "",
        };
        if (merged.email) {
          storeCheckoutThanks(merged);
          if (!stored) {
            await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                firstName: merged.firstName || "Customer",
                lastName: merged.lastName || merged.firstName || "Asleep",
                email: merged.email,
                phone: merged.phone,
                locale,
                company: "",
                cartBalance: selectCartSubtotal(cartItems),
              }),
            });
          }
        }
        setContact(merged);
        if (!checkoutConfig.fakeDoor) {
          clearCart();
        }
        window.history.replaceState({}, "", window.location.pathname);
      } catch {
        setContact(stored);
      } finally {
        setReady(true);
      }
    })();
  }, [clearCart, locale]);

  const name = contact?.firstName?.trim() || "";

  return (
    <div
      className={cn("checkout-root min-h-dvh", styles.root, styles.thanksShell)}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-5 py-6 sm:min-h-[calc(100dvh-5rem)] sm:px-8 sm:py-10">
        <div className="flex flex-1 items-center justify-center py-10 sm:py-16">
          <div className={cn(styles.thanksCard, "w-full max-w-lg")}>
            <div className={styles.thanksIcon} aria-hidden="true">
              <svg
                aria-hidden="true"
                className="size-8"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 12.5 9.5 17 19 7.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <p className={styles.thanksKicker}>{t("kicker")}</p>
            <h1 className={styles.thanksTitle}>
              {ready && name ? t("title", { name }) : t("titleAnonymous")}
            </h1>

            <p className={styles.thanksCharge}>
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 16 16"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 8.2 7 10.2 11.2 6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
              {t("notCharged")}
            </p>

            <p className={styles.thanksBody}>
              {t("body", { email: contact?.email || "—" })}
            </p>

            <Link
              className={cn(
                styles.pay,
                "mt-8 flex items-center justify-center",
              )}
              href="/"
            >
              {t("home")}
            </Link>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-2 text-[13px] text-brand">
          <Link href="/contact">{tFooter("refund")}</Link>
          <Link href="/contact">{tFooter("privacy")}</Link>
          <Link href="/contact">{tFooter("terms")}</Link>
        </footer>
      </div>
    </div>
  );
}
