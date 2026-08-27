"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type SpecItem = {
  question: string;
  answer: string;
  image?: string;
};

const accordionTransition = {
  height: {
    type: "tween" as const,
    duration: 0.42,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  opacity: {
    type: "tween" as const,
    duration: 0.28,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export function ProductSpecsAccordion({
  imageAlt,
  items,
}: {
  imageAlt: string;
  items: SpecItem[];
}) {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  const panelTransition = reduceMotion ? { duration: 0 } : accordionTransition;

  return (
    <div className="border-grey border-t">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div className="border-grey border-b" key={item.question}>
            <button
              aria-controls={`product-specs-panel-${index}`}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-bold text-base text-brand-dark leading-snug focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand"
              id={`product-specs-trigger-${index}`}
              onClick={() => toggle(index)}
              type="button"
            >
              {item.question}
              <span
                aria-hidden="true"
                className="relative flex size-5 shrink-0 items-center justify-center text-brand-dark"
              >
                <span className="absolute h-0.5 w-3.5 rounded-full bg-current" />
                <span
                  className={cn(
                    "absolute h-3.5 w-0.5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    isOpen && "scale-y-0",
                  )}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: reduceMotion
                      ? { duration: 0 }
                      : {
                          height: accordionTransition.height,
                          opacity: {
                            ...accordionTransition.opacity,
                            duration: 0.18,
                          },
                        },
                  }}
                  id={`product-specs-panel-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  key={item.question}
                  role="region"
                  transition={panelTransition}
                >
                  <div className="flex flex-col gap-4 pb-5 text-base text-brand-dark leading-7">
                    <p className="whitespace-pre-line">{item.answer}</p>
                    {item.image ? (
                      <Image
                        alt={imageAlt}
                        className="h-auto w-auto max-w-full object-contain"
                        height={1103}
                        src={item.image}
                        width={1200}
                      />
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
