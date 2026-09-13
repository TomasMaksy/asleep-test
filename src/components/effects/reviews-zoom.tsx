"use client";

import { type ReactNode, useEffect, useRef } from "react";

const SCALE_START = 1.5;
const SCALE_START_TABLET = 1.2;
const SCALE_START_MOBILE = 1.42;
const SCALE_END = 1;
const MOBILE_MAX_WIDTH = 768;
const TABLET_MAX_WIDTH = 1440;

function scaleStartForWidth(width: number) {
  if (width < MOBILE_MAX_WIDTH) {
    return SCALE_START_MOBILE;
  }
  if (width < TABLET_MAX_WIDTH) {
    return SCALE_START_TABLET;
  }
  return SCALE_START;
}

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
      const scaleStart = scaleStartForWidth(window.innerWidth);
      const scale = scaleStart + (SCALE_END - scaleStart) * progress;
      // Tailwind v4 `scale-*` uses the CSS `scale` property. Setting
      // `transform` on top of that multiplies both — override `scale` instead.
      wall.style.scale = String(scale);
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule, {
      passive: true,
    });
    window.visualViewport?.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
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
