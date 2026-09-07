"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import styles from "./checkout.module.css";

export function CheckoutClosed({
  email,
  status,
  onNotify,
}: {
  email: string;
  status: "idle" | "loading" | "ok";
  onNotify: () => void;
}) {
  const t = useTranslations("checkoutPage.closed");
  const isSuccess = status === "ok";

  return (
    <div className="mx-auto max-w-[28rem] py-6 text-left lg:py-10">
      <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#f3f3f3] text-[#1a478a]">
        {isSuccess ? (
          <svg
            aria-hidden="true"
            className="size-6"
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
        ) : (
          <svg
            aria-hidden="true"
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M12 7.5v6M12 16.5h.01"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        )}
      </div>

      <h2 className={styles.sectionTitle}>
        {isSuccess ? t("successTitle") : t("title")}
      </h2>
      <p className="whitespace-pre-line text-[#545454] text-[15px] leading-relaxed">
        {isSuccess ? t("successBody", { email }) : t("body")}
      </p>

      {isSuccess ? (
        <Link
          className={cn(styles.pay, "mt-6 flex items-center justify-center")}
          href="/"
        >
          {t("home")}
        </Link>
      ) : (
        <button
          className={cn(styles.pay, "mt-6")}
          disabled={status === "loading"}
          onClick={onNotify}
          type="button"
        >
          {status === "loading" ? (
            <span className="inline-flex items-center gap-2">
              <span className={styles.spinner} />
              {t("saving")}
            </span>
          ) : (
            t("cta")
          )}
        </button>
      )}
    </div>
  );
}
