"use client";

import {
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { checkoutConfig } from "@/lib/checkout-config";
import {
  type CheckoutContact,
  splitCheckoutName,
} from "@/lib/checkout-contact";
import { confirmAndVoidPayment } from "@/lib/checkout-stripe-flow";
import styles from "./checkout.module.css";

type Line = { name: string; amount: number };

function hasReadyWallets(
  methods:
    | {
        amazonPay: boolean;
        applePay: boolean;
        googlePay: boolean;
        link: boolean;
        paypal: boolean;
        klarna: boolean;
      }
    | undefined,
) {
  if (!methods) {
    return false;
  }
  return (
    methods.applePay ||
    methods.googlePay ||
    methods.paypal ||
    methods.link ||
    methods.amazonPay ||
    methods.klarna
  );
}

function hasChangedWallets(
  methods: Record<string, { available: boolean } | undefined> | undefined,
) {
  if (!methods) {
    return false;
  }
  return Object.values(methods).some((method) => method?.available);
}

type Props = {
  amountCents: number;
  lineItems: Line[];
  returnUrl: string;
  onPaid: (contact: CheckoutContact) => void;
};

export function CheckoutExpress({
  amountCents,
  lineItems,
  returnUrl,
  onPaid,
}: Props) {
  const t = useTranslations("checkoutPage");
  const stripe = useStripe();
  const elements = useElements();
  const [hasWallets, setHasWallets] = useState(false);
  const [error, setError] = useState("");
  const amountRef = useRef(amountCents);
  amountRef.current = amountCents;

  const shippingRates = useMemo(
    () => [
      {
        id: "standard",
        amount: 0,
        displayName: t("shipping.free"),
        deliveryEstimate: {
          minimum: { unit: "business_day" as const, value: 3 },
          maximum: { unit: "business_day" as const, value: 7 },
        },
      },
    ],
    [t],
  );

  if (!stripe || !elements) {
    return null;
  }

  return (
    <section className={hasWallets ? undefined : styles.expressPending}>
      {hasWallets ? (
        <h2 className={styles.sectionTitle}>{t("expressTitle")}</h2>
      ) : null}
      <ExpressCheckoutElement
        onAvailablePaymentMethodsChange={(event) => {
          setHasWallets(hasChangedWallets(event.paymentMethods));
        }}
        onConfirm={async (event) => {
          const names = splitCheckoutName(event.billingDetails?.name ?? "");
          const contact: CheckoutContact = {
            firstName: names.firstName || "Customer",
            lastName: names.lastName || names.firstName || "asleep",
            email: event.billingDetails?.email ?? "",
            phone: event.billingDetails?.phone ?? "",
          };

          if (checkoutConfig.fakeDoor) {
            onPaid(contact);
            return;
          }

          try {
            const paid = await confirmAndVoidPayment({
              amountCents: amountRef.current,
              billing: {
                email: contact.email,
                name: event.billingDetails?.name ?? "",
                phone: contact.phone,
                address: {
                  line1: event.billingDetails?.address?.line1 ?? "",
                  line2: event.billingDetails?.address?.line2 ?? "",
                  city: event.billingDetails?.address?.city ?? "",
                  state:
                    event.billingDetails?.address?.state ||
                    event.billingDetails?.address?.city ||
                    "",
                  postal_code: event.billingDetails?.address?.postal_code ?? "",
                  country: event.billingDetails?.address?.country ?? "",
                },
              },
              elements,
              returnUrl,
              stripe,
            });
            onPaid({
              firstName: paid.firstName || contact.firstName,
              lastName: paid.lastName || contact.lastName,
              email: paid.email || contact.email,
              phone: paid.phone || contact.phone,
            });
          } catch (cause) {
            const message =
              cause instanceof Error ? cause.message : t("expressUnavailable");
            setError(message);
            event.paymentFailed({ reason: "fail" });
          }
        }}
        onLoadError={() => {
          setHasWallets(false);
        }}
        onReady={(event) => {
          setHasWallets(hasReadyWallets(event.availablePaymentMethods));
        }}
        onShippingRateChange={({ resolve, shippingRate }) => {
          const productLines = lineItems.filter(
            (item) => item.name !== t("summary.shipping"),
          );
          const nextAmount =
            productLines.reduce((sum, item) => sum + item.amount, 0) +
            shippingRate.amount;
          amountRef.current = nextAmount;
          void elements.update({ amount: nextAmount }).catch(() => undefined);
          resolve({
            lineItems: [
              ...productLines,
              { name: t("summary.shipping"), amount: shippingRate.amount },
            ],
          });
        }}
        options={{
          buttonHeight: 44,
          buttonTheme: {
            applePay: "black",
            googlePay: "black",
            paypal: "gold",
          },
          buttonType: {
            applePay: "plain",
            googlePay: "plain",
            paypal: "paypal",
          },
          emailRequired: true,
          phoneNumberRequired: false,
          billingAddressRequired: true,
          shippingAddressRequired: true,
          allowedShippingCountries: [
            ...checkoutConfig.countries.map((country) => country.code),
          ],
          business: { name: checkoutConfig.shopName },
          layout: { maxColumns: 2, maxRows: 2, overflow: "never" },
          lineItems,
          paymentMethodOrder: ["apple_pay", "google_pay", "paypal"],
          paymentMethods: {
            amazonPay: "never",
            applePay: "always",
            googlePay: "always",
            klarna: "never",
            link: "never",
            paypal: "auto",
          },
          shippingRates,
        }}
      />
      {error && hasWallets ? <p className={styles.error}>{error}</p> : null}
      {hasWallets ? <p className={styles.divider}>{t("or")}</p> : null}
    </section>
  );
}
