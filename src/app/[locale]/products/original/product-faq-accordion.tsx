"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { CheckItem } from "@/components/ui/check-item";
import { cn } from "@/lib/utils";

export type ProductFaqSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type ProductFaqItem = {
  question: string;
  answer?: string;
  materialsHeading?: string;
  materials?: string[];
  sections?: ProductFaqSection[];
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

function FaqSectionBlock({ section }: { section: ProductFaqSection }) {
  return (
    <div>
      <p className="mb-2 font-bold">{section.heading}</p>
      <p>{section.body}</p>
      {section.bullets?.length ? (
        <ul className="mt-3 flex flex-col gap-1">
          {section.bullets.map((bullet) => (
            <li key={bullet}>
              <CheckItem
                className="gap-x-2 text-brand-dark"
                iconClassName="mt-0.5 size-4 text-brand-dark/35"
              >
                {bullet}
              </CheckItem>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const DEFAULT_OPEN_INDEX = 0;

export function ProductFaqAccordion({ items }: { items: ProductFaqItem[] }) {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(DEFAULT_OPEN_INDEX);

  function toggle(index: number) {
    setOpenIndex((current) =>
      current === index ? DEFAULT_OPEN_INDEX : index,
    );
  }

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : accordionTransition;

  return (
    <div className="border-grey border-t">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div className="border-grey border-b" key={item.question}>
            <button
              aria-controls={`product-faq-panel-${index}`}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-bold text-base text-brand-dark leading-snug"
              id={`product-faq-trigger-${index}`}
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
                  id={`product-faq-panel-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  key={item.question}
                  role="region"
                  transition={panelTransition}
                >
                  <div className="flex flex-col gap-5 pb-4 text-base text-brand-dark leading-7">
                    {item.answer ? <p>{item.answer}</p> : null}

                    {item.materials?.length ? (
                      <div>
                        {item.materialsHeading ? (
                          <p className="mb-2 font-bold">
                            {item.materialsHeading}
                          </p>
                        ) : null}
                        <ul className="flex flex-col gap-1">
                          {item.materials.map((material) => (
                            <li key={material}>
                              <CheckItem
                                className="gap-x-2 text-brand-dark"
                                iconClassName="mt-0.5 size-4 text-brand-dark/35"
                              >
                                {material}
                              </CheckItem>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {item.sections?.map((section) => (
                      <FaqSectionBlock
                        key={section.heading}
                        section={section}
                      />
                    ))}
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
