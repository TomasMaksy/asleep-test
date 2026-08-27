"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { type FormEvent, useId, useState } from "react";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "loading" | "ok" | "error";

function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

function Spinner() {
  return (
    <motion.span
      aria-hidden="true"
      animate={{ rotate: 360 }}
      className="size-[14px] rounded-full border-2 border-[#1A478A]/25 border-t-[#1A478A]"
      transition={{
        duration: 0.7,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      }}
    />
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      viewBox="0 0 14 14"
    >
      <motion.path
        animate={{ pathLength: 1 }}
        d="M2.5 7.2 5.6 10.2 11.5 3.8"
        initial={{ pathLength: 0 }}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function NewsletterForm() {
  const t = useTranslations("footer");
  const inputId = useId();
  const messageId = useId();
  const reduceMotion = useReducedMotion();

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
      setMessage(
        data.alreadySubscribed
          ? "You're already on the list."
          : "Thanks — you're on the list.",
      );
      setEmail("");
      setTouched(false);
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  const buttonLabel =
    status === "loading"
      ? "Subscribing"
      : status === "ok"
        ? "Subscribed"
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
            aria-describedby={message ? messageId : undefined}
            aria-invalid={hasClientError || undefined}
            aria-label={t("newsletter")}
            autoComplete="email"
            className={cn(
              "newsletter-input h-full w-full min-w-0 border-0 bg-transparent py-2 pr-5 pl-5 text-base text-white outline-none ring-0",
              "placeholder:font-normal placeholder:text-base placeholder:text-white/85",
              "disabled:cursor-not-allowed disabled:opacity-70",
              "md:pr-[7.75rem] md:text-rg md:placeholder:text-rg",
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
          <motion.button
            aria-live="polite"
            className={cn(
              "relative inline-flex h-10 min-w-[7.25rem] cursor-pointer items-center justify-center overflow-hidden rounded-full px-5 font-sans text-sm leading-none tracking-normal",
              "bg-white text-[#1A478A] transition-colors duration-300 ease-out",
              "hover:bg-[#2B2D41] hover:text-white",
              "disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#1A478A]",
              isSuccess &&
                "bg-emerald-400 text-[#12301f] hover:bg-[#2B2D41] hover:text-white",
            )}
            disabled={isBusy}
            type="submit"
            whileTap={reduceMotion || isBusy ? undefined : { scale: 0.98 }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="inline-flex items-center gap-2"
                exit={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                key={status === "loading" ? "loading" : status}
                transition={{
                  duration: reduceMotion ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {status === "loading" ? <Spinner /> : null}
                {status === "ok" ? <CheckIcon /> : null}
                <span>{buttonLabel}</span>
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div aria-live="polite" className="min-h-[1.5rem] pt-2" id={messageId}>
        <AnimatePresence mode="wait">
          {message ? (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-base leading-snug",
                status === "ok" ? "text-emerald-300" : "text-red-300",
              )}
              exit={{ opacity: 0, y: -4 }}
              initial={{ opacity: 0, y: 4 }}
              key={`${status}-${message}`}
              transition={{
                duration: reduceMotion ? 0 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {message}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
