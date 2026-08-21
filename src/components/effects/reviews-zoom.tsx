"use client";

import { type ReactNode, useEffect, useRef } from "react";

const SCALE_START = 1.8;
const SCALE_END = 1;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Scroll-linked scale on `[data-reviews-wall]` inside the section. */
export function ReviewsZoom({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const wall = section.querySelector<HTMLElement>("[data-reviews-wall]");
    if (!wall) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const scale = SCALE_START + (SCALE_END - SCALE_START) * progress;
      wall.style.transform = `scale(${scale})`;
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <section
      className="relative h-screen overflow-hidden bg-surface"
      ref={sectionRef}
    >
      {children}
    </section>
  );
}
