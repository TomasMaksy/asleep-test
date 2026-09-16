"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useId, useState } from "react";
import { captureNewsletterSignup } from "@/lib/tracking/client/posthog";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "loading" | "ok" | "error";

function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-[14px] animate-spin rounded-full border-2 border-[#1A478A]/25 border-t-[#1A478A]"
    />
  );
}

export function NewsletterForm() {
  const t = useTranslations("footer");
  const inputId = useId();
  const messageId = useId();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);

  const trimmed = email.trim();
  const empty = trimmed.length === 0;
  const invalid = !empty && !isValidEmail(trimmed);
  const hasClientError = showInvalid && (empty || invalid);
  const isBusy = status === "loading";
  const isSuccess = status === "ok";

  const clientErrorMessage = empty
    ? "Please enter your email address."
    : "Please enter a valid email address.";

  function resetFeedback() {
    if (status === "error" || status === "ok") {
      setStatus("idle");
      setMessage("");
    }
    setShowInvalid(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (isBusy) {
      return;
    }

    if (empty || invalid) {
      setShowInvalid(true);
      setStatus("error");
      setMessage(clientErrorMessage);
      return;
    }

    setShowInvalid(false);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "website-footer" }),
      });

      let data: {
        error?: string;
        ok?: boolean;
        alreadySubscribed?: boolean;
      } = {};
      try {
        data = (await response.json()) as typeof data;
      } catch {
        data = {};
      }

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("ok");
      setMessage("");
      setEmail("");
      setTouched(false);
      try {
        captureNewsletterSignup(trimmed, "website-footer");
      } catch {
        // Tracking must never block a successful subscribe.
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  const subscribedLabel = t("subscribed");
  const showSubscribedText = subscribedLabel.length > 0;
  const buttonLabel =
    status === "loading"
      ? t("subscribe")
      : status === "ok"
        ? subscribedLabel
        : t("subscribe");

  return (
    <form
      aria-busy={isBusy}
      className="w-full max-w-[350px]"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="relative flex flex-col gap-3 md:block md:h-[52px]">
        <div
          className={cn(
            "group flex h-[52px] w-full items-center overflow-hidden rounded-full border border-transparent bg-white/10 transition-[background-color,border-color] duration-300",
            "focus-within:border-white/35 focus-within:bg-white/[0.14]",
            "md:absolute md:inset-0",
            hasClientError &&
              "border-red-400/55 bg-red-500/15 focus-within:border-red-400/75",
            isSuccess && "border-emerald-400/45 bg-emerald-400/15",
          )}
        >
          <input
            aria-describedby={hasClientError && message ? messageId : undefined}
            aria-invalid={hasClientError || undefined}
            aria-label={t("newsletter")}
            autoComplete="email"
            className={cn(
              "newsletter-input h-full w-full min-w-0 border-0 bg-transparent py-2 pr-5 pl-5 text-base text-white outline-none ring-0",
              "placeholder:font-normal placeholder:text-base placeholder:text-white/85",
              "disabled:cursor-not-allowed disabled:opacity-70",
              isSuccess && !showSubscribedText
                ? "md:pr-14 md:text-rg md:placeholder:text-rg"
                : "md:pr-[7.75rem] md:text-rg md:placeholder:text-rg",
            )}
            disabled={isBusy}
            id={inputId}
            inputMode="email"
            name="email"
            onBlur={() => {
              setTouched(true);
              if (!empty && invalid) {
                setShowInvalid(true);
                setStatus("error");
                setMessage("Please enter a valid email address.");
              }
            }}
            onChange={(event) => {
              setEmail(event.target.value);
              if (touched || showInvalid || status !== "idle") {
                resetFeedback();
              }
            }}
            placeholder={t("newsletter")}
            spellCheck={false}
            type="email"
            value={email}
          />
        </div>

        <div className="self-start md:absolute md:top-1.5 md:right-1.5">
          <button
            aria-label={isSuccess ? t("subscribedAria") : undefined}
            aria-live="polite"
            className={cn(
              "relative inline-flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-full font-sans text-sm leading-none tracking-normal",
              "bg-white text-[#1A478A] transition-[width,padding,background-color,color] duration-300 ease-out",
              "hover:bg-[#2B2D41] hover:text-white",
              "disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#1A478A]",
              isSuccess && showSubscribedText
                ? "min-w-[7.25rem] bg-emerald-400 px-5 text-[#12301f] hover:bg-[#2B2D41] hover:text-white"
                : isSuccess
                  ? "size-10 min-w-10 bg-emerald-400 px-0 text-[#12301f] hover:bg-[#2B2D41] hover:text-white"
                  : "min-w-[7.25rem] px-5",
            )}
            disabled={isBusy}
            type="submit"
          >
            <span className="inline-flex items-center gap-2">
              {status === "loading" ? <Spinner /> : null}
              {status === "ok" ? (
                <Check className="size-3.5" strokeWidth={2} />
              ) : null}
              {buttonLabel ? <span>{buttonLabel}</span> : null}
            </span>
          </button>
        </div>
      </div>

      {status === "error" && message ? (
        <p
          aria-live="polite"
          className="min-h-[1.5rem] pt-2 text-base text-red-300 leading-snug"
          id={messageId}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
