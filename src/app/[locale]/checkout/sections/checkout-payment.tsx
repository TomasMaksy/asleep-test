"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LockIcon } from "@/app/[locale]/checkout/sections/checkout-icons";
import styles from "./checkout.module.css";

export function CheckoutPayment({ error }: { error: string }) {
  const t = useTranslations("checkoutPage");
  const stripe = useStripe();
  const elements = useElements();
  const [https, setHttps] = useState(false);
  const [originReady, setOriginReady] = useState(false);

  useEffect(() => {
    setHttps(window.location.protocol === "https:");
    setOriginReady(true);
  }, []);

  return (
    <section className="mt-10">
      <h2 className={styles.sectionTitle}>{t("payment.title")}</h2>
      <p className={styles.secure}>
        <LockIcon className="size-3" />
        {t("payment.secure")}
      </p>

      {stripe && elements && originReady ? (
        <div className={styles.paymentElement}>
          <PaymentElement
            onLoadError={() => undefined}
            options={{
              fields: {
                billingDetails: {
                  address: "never",
                  email: "never",
                  name: "never",
                  phone: "never",
                },
              },
              layout: "tabs",
              wallets: {
                applePay: https ? "auto" : "never",
                googlePay: https ? "auto" : "never",
                link: "never",
              },
            }}
          />
        </div>
      ) : (
        <div className={styles.paymentElement} />
      )}
      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}
