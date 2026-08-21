"use client";

import { type ReactNode, useEffect, useRef } from "react";

const PARALLAX_RATE = 0.087;
const PARALLAX_CLAMP = 100;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Applies opposing column parallax on lg+ without owning the product markup. */
export function ProductsParallax({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const originalCol = section.querySelector<HTMLElement>(
      '[data-parallax="original"]',
    );
    const hybridCol = section.querySelector<HTMLElement>(
      '[data-parallax="hybrid"]',
    );

    if (!originalCol || !hybridCol) {
      return;
    }

    const desktop = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    const update = () => {
      frame = 0;

      if (!desktop.matches) {
        originalCol.style.transform = "";
        hybridCol.style.transform = "";
        return;
      }

      const rect = section.getBoundingClientRect();
      const anchor =
        window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
      const translate = clamp(
        (window.scrollY - anchor) * PARALLAX_RATE,
        -PARALLAX_CLAMP,
        PARALLAX_CLAMP,
      );

      originalCol.style.transform = `translateY(${translate}px)`;
      hybridCol.style.transform = `translateY(${-translate}px)`;
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <section className="bg-white" ref={sectionRef}>
      {children}
    </section>
  );
}
