"use client";

import { type ReactNode, useEffect, useRef } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

/** Scroll-linked speeds so copy/CTA rise out from under the mattress. */
export function ConfiguratorParallax({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const layers = {
      fast: root.querySelectorAll<HTMLElement>('[data-parallax="fast"]'),
      slow: root.querySelectorAll<HTMLElement>('[data-parallax="slow"]'),
    };
    let frame = 0;

    const update = () => {
      frame = 0;

      if (reduceMotion.matches) {
        for (const el of [...layers.fast, ...layers.slow]) {
          el.style.transform = "";
        }
        return;
      }

      const rect = root.getBoundingClientRect();
      const progress = clamp(
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
        0,
        1,
      );
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const fastProgress = clamp(progress * (mobile ? 1 : 1.08), 0, 1);
      const fastY = mobile
        ? lerp(8, -16, fastProgress)
        : lerp(40, -64, fastProgress);
      const slowY = mobile ? lerp(4, -10, progress) : lerp(10, -22, progress);

      for (const el of layers.fast) {
        el.style.transform = `translate3d(0, ${fastY}px, 0)`;
      }
      for (const el of layers.slow) {
        el.style.transform = `translate3d(0, ${slowY}px, 0)`;
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduceMotion.addEventListener("change", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduceMotion.removeEventListener("change", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="w-full" ref={rootRef}>
      {children}
    </div>
  );
}
