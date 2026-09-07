"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const easeOut = [0.22, 1, 0.36, 1] as const;

function persistContactEmail(
  value: string,
  savedEmailRef: { current: string },
) {
  const trimmed = value.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed) || trimmed === savedEmailRef.current) {
    return;
  }

  savedEmailRef.current = trimmed;
  void fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: trimmed, source: "contact-form" }),
  });
}

function Spinner({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.span
      aria-hidden="true"
      animate={reduceMotion ? undefined : { rotate: 360 }}
      className="size-4 rounded-full border-2 border-white/25 border-t-white"
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: 0.7,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }
      }
    />
  );
}

function SuccessCheck({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">
      <svg
        aria-hidden="true"
        className="size-7"
        fill="none"
        viewBox="0 0 24 24"
      >
        <motion.path
          animate={{ pathLength: 1 }}
          d="M5 12.5 9.5 17 19 7.5"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: easeOut }}
        />
      </svg>
    </div>
  );
}

const fieldClassName =
  "h-12 w-full rounded-xl border border-grey bg-white px-4 text-base text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand disabled:opacity-60";

type Status = "idle" | "loading" | "ok" | "error";

export function ContactForm() {
  const t = useTranslations("contactPage.form");
  const locale = useLocale();
  const formId = useId();
  const reduceMotion = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const savedEmailRef = useRef("");

  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed) || trimmed === savedEmailRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      persistContactEmail(trimmed, savedEmailRef);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [email]);

  const isBusy = status === "loading";
  const isSuccess = status === "ok";
  const duration = reduceMotion ? 0 : 0.5;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy || isSuccess) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setStatus("error");
      setError(t("errors.name"));
      return;
    }

    if (!trimmedEmail) {
      setStatus("error");
      setError(t("errors.emailRequired"));
      return;
    }

    if (!EMAIL_RE.test(trimmedEmail)) {
      setStatus("error");
      setError(t("errors.emailInvalid"));
      return;
    }

    if (!trimmedMessage) {
      setStatus("error");
      setError(t("errors.message"));
      return;
    }

    const honeypot = new FormData(event.currentTarget).get("company");

    setStatus("loading");
    setError("");

    const cart = useCartStore.getState().items.map((item) => ({
      id: item.id,
      name: item.name,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          message: trimmedMessage,
          locale,
          page: `${window.location.pathname}${window.location.search}`,
          referrer: document.referrer,
          company: typeof honeypot === "string" ? honeypot : "",
          cart,
        }),
      });

      let data: { error?: string; ok?: boolean } = {};
      try {
        data = (await response.json()) as typeof data;
      } catch {
        data = {};
      }

      if (!response.ok) {
        setStatus("error");
        setError(data.error || t("errors.generic"));
        return;
      }

      setSubmittedEmail(trimmedEmail);
      setStatus("ok");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setStatus("error");
      setError(t("errors.network"));
    }
  }

  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-[28px] border border-grey bg-surface",
        isSuccess
          ? "mx-auto w-full max-w-md px-8 py-10 md:px-10 md:py-12"
          : "w-full p-6 md:p-8 lg:p-10",
      )}
      layout
      transition={{
        layout: { duration, ease: easeOut },
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {isSuccess ? (
          <motion.div
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="text-center"
            exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            key="success"
            transition={{ duration, ease: easeOut }}
          >
            <SuccessCheck reduceMotion={reduceMotion} />
            <p className="font-bold font-heading text-brand-dark text-xl md:text-2xl">
              {t("successTitle")}
            </p>
            <p className="mt-3 text-base text-brand-dark/80 leading-7">
              {t("successBody", { email: submittedEmail })}
            </p>
          </motion.div>
        ) : (
          <motion.form
            animate={{ opacity: 1 }}
            className="relative flex flex-col gap-5"
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            initial={{ opacity: 1 }}
            key="form"
            noValidate
            onSubmit={onSubmit}
            transition={{ duration, ease: easeOut }}
          >
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            >
              <label htmlFor={`${formId}-company`}>Company</label>
              <input
                autoComplete="off"
                id={`${formId}-company`}
                name="company"
                tabIndex={-1}
                type="text"
              />
            </div>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-dark text-sm">
                {t("nameLabel")}
              </span>
              <input
                autoComplete="name"
                className={fieldClassName}
                disabled={isBusy}
                name="name"
                onChange={(event) => {
                  setName(event.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setError("");
                  }
                }}
                placeholder={t("namePlaceholder")}
                required
                type="text"
                value={name}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-dark text-sm">
                {t("emailLabel")}
              </span>
              <input
                autoComplete="email"
                className={fieldClassName}
                disabled={isBusy}
                inputMode="email"
                name="email"
                onBlur={() => persistContactEmail(email, savedEmailRef)}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setError("");
                  }
                }}
                placeholder={t("emailPlaceholder")}
                required
                spellCheck={false}
                type="email"
                value={email}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-dark text-sm">
                {t("phoneLabel")}{" "}
                <span className="font-normal text-brand-dark/50">
                  ({t("phoneOptional")})
                </span>
              </span>
              <input
                autoComplete="tel"
                className={fieldClassName}
                disabled={isBusy}
                inputMode="tel"
                name="phone"
                onChange={(event) => setPhone(event.target.value)}
                placeholder={t("phonePlaceholder")}
                type="tel"
                value={phone}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-brand-dark text-sm">
                {t("messageLabel")}
              </span>
              <textarea
                className="min-h-36 w-full resize-y rounded-xl border border-grey bg-white px-4 py-3 text-base text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand disabled:opacity-60"
                disabled={isBusy}
                name="message"
                onChange={(event) => {
                  setMessage(event.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setError("");
                  }
                }}
                placeholder={t("messagePlaceholder")}
                required
                value={message}
              />
            </label>

            <div aria-live="polite" className="min-h-6">
              {error ? (
                <p className="text-red-600 text-sm leading-snug">{error}</p>
              ) : null}
            </div>

            <motion.button
              className={cn(
                "inline-flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-brand px-8 text-base text-white",
                "hover:bg-brand-dark disabled:cursor-not-allowed",
              )}
              disabled={isBusy}
              type="submit"
              whileTap={reduceMotion || isBusy ? undefined : { scale: 0.98 }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  className="inline-flex items-center gap-2"
                  exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  key={isBusy ? "loading" : "idle"}
                  transition={{
                    duration: reduceMotion ? 0 : 0.22,
                    ease: easeOut,
                  }}
                >
                  {isBusy ? <Spinner reduceMotion={reduceMotion} /> : null}
                  <span>{isBusy ? t("sending") : t("submit")}</span>
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
