"use client";

import { Elements, useElements } from "@stripe/react-stripe-js";
import { useLocale } from "next-intl";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import { checkoutConfig } from "@/lib/checkout-config";
import { stripePromise } from "@/lib/stripe-public";

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const text =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason ?? "");
    if (text.includes("Frame not initialized")) {
      event.preventDefault();
    }
  });
}

function SyncAmount({ amountCents }: { amountCents: number }) {
  const elements = useElements();
  const lastAmount = useRef<number | null>(null);

  useEffect(() => {
    if (!elements || amountCents < 50) {
      return;
    }
    if (lastAmount.current === null) {
      lastAmount.current = amountCents;
      return;
    }
    if (lastAmount.current === amountCents) {
      return;
    }
    lastAmount.current = amountCents;
    void elements.update({ amount: amountCents }).catch(() => undefined);
  }, [amountCents, elements]);

  return null;
}

export function CheckoutElements({
  amountCents,
  children,
}: {
  amountCents: number;
  children: ReactNode;
}) {
  const locale = useLocale();
  const initialAmount = useRef(Math.max(amountCents, 50)).current;

  const options = useMemo(
    () => ({
      amount: initialAmount,
      appearance: {
        labels: "above" as const,
        theme: "stripe" as const,
        variables: {
          borderRadius: checkoutConfig.theme.radius,
          colorDanger: checkoutConfig.theme.error,
          colorPrimary: checkoutConfig.theme.accent,
          colorText: checkoutConfig.theme.text,
          fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif",
          fontSizeBase: "16px",
        },
      },
      captureMethod: "manual" as const,
      currency: checkoutConfig.currency.toLowerCase(),
      locale: locale === "lt" ? ("lt" as const) : ("en" as const),
      mode: "payment" as const,
    }),
    [initialAmount, locale],
  );

  return (
    <Elements options={options} stripe={stripePromise}>
      <SyncAmount amountCents={amountCents} />
      {children}
    </Elements>
  );
}
