"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

const sheetTransition = {
  type: "tween" as const,
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

type ReviewShareSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 20 20">
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function RatingPicker({
  value,
  onChange,
  labelForStar,
  heading,
}: {
  value: number;
  onChange: (value: number) => void;
  labelForStar: (count: number) => string;
  heading: string;
}) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const [bounceId, setBounceId] = useState(0);
  const preview = hovered ?? value;

  return (
    <div>
      <p className="mb-2 font-medium text-brand-dark text-sm">{heading}</p>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= preview;
          const isHoverPreview = hovered !== null;

          return (
            <motion.button
              animate={
                bounceId === star && !reduceMotion
                  ? { scale: [1, 1.28, 0.92, 1.08, 1] }
                  : { scale: 1 }
              }
              aria-label={labelForStar(star)}
              className="cursor-pointer p-0.5"
              key={star}
              onClick={() => {
                onChange(star);
                setBounceId(0);
                requestAnimationFrame(() => setBounceId(star));
              }}
              onMouseEnter={() => setHovered(star)}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
              }
              type="button"
            >
              <svg
                aria-hidden="true"
                className={cn(
                  "size-7 transition-[fill,opacity] duration-150",
                  active
                    ? isHoverPreview
                      ? "fill-[#f9ce23]/50"
                      : "fill-[#f9ce23]"
                    : "fill-[#e5e7eb]",
                )}
                viewBox="0 0 20 20"
              >
                <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
              </svg>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewShareSheet({ isOpen, onClose }: ReviewShareSheetProps) {
  const t = useTranslations("reviewsPage.shareSheet");
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : sheetTransition.duration;
  const formId = useId();
  const products = t.raw("products") as string[];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState(products[0] ?? "");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSubmitted(false);
    setSending(false);
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setSending(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setTitle("");
    setBody("");
    setRating(5);
    setProduct(products[0] ?? "");
  }

  const fieldClassName =
    "h-12 w-full rounded-xl border border-grey bg-white px-4 text-base text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand";

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[2000]" key="review-share-sheet">
          <motion.button
            animate={{ opacity: 1 }}
            aria-label={t("close")}
            className="absolute inset-0 cursor-pointer bg-brand-dark/25 backdrop-blur-[6px] supports-[backdrop-filter]:bg-brand-dark/20"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration, ease: sheetTransition.ease }}
            type="button"
          />

          <motion.aside
            animate={{ x: 0 }}
            aria-labelledby={`${formId}-title`}
            aria-modal="true"
            className={cn(
              "absolute inset-y-0 right-0 flex w-full flex-col bg-white text-brand-dark shadow-[-12px_0_40px_rgba(0,0,0,0.12)]",
              "md:w-[50%] lg:w-[min(40%,512px)]",
            )}
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            role="dialog"
            transition={{ duration, ease: sheetTransition.ease }}
          >
            <header className="flex h-20 shrink-0 items-center justify-between border-brand-dark/10 border-b px-5 md:px-8">
              <h2
                className="!text-[1.25rem] !leading-snug !tracking-normal pr-4 font-bold"
                id={`${formId}-title`}
              >
                {t("title")}
              </h2>
              <button
                aria-label={t("close")}
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-brand-dark/15 transition-colors hover:bg-surface"
                onClick={onClose}
                type="button"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-6 md:px-8">
              {submitted ? (
                <div className="flex flex-1 flex-col items-start justify-center gap-4">
                  <p className="font-bold text-brand-dark text-xl">
                    {t("successTitle")}
                  </p>
                  <p className="text-brand-dark/70 text-base leading-7">
                    {t("successBody")}
                  </p>
                  <button
                    className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 text-base text-white transition-colors hover:bg-brand-dark"
                    onClick={onClose}
                    type="button"
                  >
                    {t("done")}
                  </button>
                </div>
              ) : (
                <form
                  className="flex flex-1 flex-col gap-5"
                  onSubmit={handleSubmit}
                >
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-brand-dark text-sm">
                      {t("nameLabel")}
                    </span>
                    <input
                      autoComplete="name"
                      className={fieldClassName}
                      onChange={(event) => setName(event.target.value)}
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
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t("emailPlaceholder")}
                      required
                      type="email"
                      value={email}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-brand-dark text-sm">
                      {t("productLabel")}
                    </span>
                    <select
                      className={cn(fieldClassName, "cursor-pointer pr-10")}
                      onChange={(event) => setProduct(event.target.value)}
                      required
                      value={product}
                    >
                      {products.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <RatingPicker
                    heading={t("ratingLabel")}
                    labelForStar={(count) => t("ratingStar", { count })}
                    onChange={setRating}
                    value={rating}
                  />

                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-brand-dark text-sm">
                      {t("reviewTitleLabel")}
                    </span>
                    <input
                      className={fieldClassName}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={t("reviewTitlePlaceholder")}
                      required
                      type="text"
                      value={title}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-brand-dark text-sm">
                      {t("reviewBodyLabel")}
                    </span>
                    <textarea
                      className="min-h-32 w-full resize-y rounded-xl border border-grey bg-white px-4 py-3 text-base text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-brand"
                      onChange={(event) => setBody(event.target.value)}
                      placeholder={t("reviewBodyPlaceholder")}
                      required
                      value={body}
                    />
                  </label>

                  <div className="mt-auto flex justify-end pt-2 pb-2">
                    <button
                      className="inline-flex h-12 min-w-[120px] cursor-pointer items-center justify-center rounded-full bg-brand px-8 text-base text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                      disabled={sending}
                      type="submit"
                    >
                      {sending ? t("sending") : t("send")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
