"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CarouselItem = {
  title: string;
  body: string;
  date: string;
};

const slideTransition = {
  type: "tween" as const,
  duration: 0.45,
  ease: [0.32, 0.72, 0, 1] as const,
};

function Stars() {
  return (
    <div aria-hidden="true" className="mb-5 flex gap-0.5">
      {["1", "2", "3", "4", "5"].map((key) => (
        <svg
          className="size-3.5 fill-[#f9ce23]"
          key={key}
          viewBox="0 0 20 20"
        >
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewColumn({ item }: { item: CarouselItem }) {
  return (
    <article className="flex w-[calc(100vw-6rem)] shrink-0 flex-col sm:w-[340px] lg:w-[360px]">
      <Stars />
      <h3 className="font-bold text-brand-dark text-base leading-snug md:text-lg">
        {item.title}
      </h3>
      <p className="mt-4 text-brand-dark/75 text-base leading-7">{item.body}</p>
      <p className="mt-8 text-brand-dark/40 text-sm">{item.date}</p>
    </article>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ReviewsCarouselSection() {
  const t = useTranslations("reviewsPage.carousel");
  const items = t.raw("items") as CarouselItem[];
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const x = useMotionValue(0);

  const offsetForIndex = useCallback(
    (nextIndex: number) => {
      if (!step) return 0;
      return -Math.min(nextIndex * step, maxScroll);
    },
    [maxScroll, step],
  );

  const snapTo = useCallback(
    (nextIndex: number) => {
      const target = clamp(nextIndex, 0, maxIndex);
      const destination = offsetForIndex(target);
      setIndex(target);
      void animate(
        x,
        destination,
        reduceMotion ? { duration: 0 } : slideTransition,
      );
    },
    [maxIndex, offsetForIndex, reduceMotion, x],
  );

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>("[data-review-card]");
    if (!viewport || !track || !card) return;

    const styles = window.getComputedStyle(track);
    const gap =
      Number.parseFloat(styles.columnGap || styles.gap || "0") || 40;
    const nextStep = card.offsetWidth + gap;
    const nextMaxScroll = Math.max(
      0,
      track.scrollWidth - viewport.clientWidth,
    );
    const nextMax =
      nextStep > 0
        ? Math.max(0, Math.ceil(nextMaxScroll / nextStep))
        : 0;

    setStep(nextStep);
    setMaxScroll(nextMaxScroll);
    setMaxIndex(nextMax);
    setIndex((current) => {
      const next = Math.min(current, nextMax);
      x.set(nextStep ? -Math.min(next * nextStep, nextMaxScroll) : 0);
      return next;
    });
  }, [x]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, items.length]);

  return (
    <section
      className="scroll-mt-16 overflow-x-clip bg-white py-14 md:py-20 lg:scroll-mt-20"
      id="reviews-list"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="px-5 md:px-10" ref={viewportRef}>
          <motion.div
            className="flex w-max cursor-grab gap-10 active:cursor-grabbing md:gap-12 lg:gap-16"
            drag={maxScroll > 0 ? "x" : false}
            dragConstraints={
              maxScroll > 0
                ? { left: -maxScroll, right: 0 }
                : { left: 0, right: 0 }
            }
            dragElastic={0.14}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
            onDragEnd={(_, info) => {
              if (!step) return;

              const offset = x.get();
              const velocity = info.velocity.x;
              let target = Math.round(-offset / step);

              if (Math.abs(velocity) > 500) {
                target += velocity > 0 ? -1 : 1;
              }

              // Prefer the true end stop when close to the last card.
              if (maxScroll > 0 && -offset >= maxScroll - step / 2) {
                target = maxIndex;
              }

              snapTo(target);
            }}
            ref={trackRef}
            style={{ x }}
          >
            {items.map((item) => (
              <div data-review-card="" key={`${item.title}-${item.date}`}>
                <ReviewColumn item={item} />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-10 flex items-center justify-end gap-3 px-5 md:px-10">
          <button
            aria-label={t("prev")}
            className={cn(
              "flex size-11 cursor-pointer items-center justify-center rounded-full border border-grey bg-white text-brand-dark transition-colors hover:border-brand hover:bg-surface",
              index <= 0 && "pointer-events-none opacity-40",
            )}
            onClick={() => snapTo(index - 1)}
            type="button"
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} />
          </button>
          <button
            aria-label={t("next")}
            className={cn(
              "flex size-11 cursor-pointer items-center justify-center rounded-full border border-grey bg-white text-brand-dark transition-colors hover:border-brand hover:bg-surface",
              index >= maxIndex && "pointer-events-none opacity-40",
            )}
            onClick={() => snapTo(index + 1)}
            type="button"
          >
            <ChevronRight className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </section>
  );
}
