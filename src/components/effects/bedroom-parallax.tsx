"use client";

import { type ReactNode, useEffect, useRef } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Scroll-linked translateY on `[data-bedroom-cell]` children. */
export function BedroomParallax({
  children,
  offsets,
}: {
  children: ReactNode;
  offsets: number[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    const cells = [
      ...grid.querySelectorAll<HTMLElement>("[data-bedroom-cell]"),
    ];
    let frame = 0;

    const update = () => {
      frame = 0;
      const top = grid.getBoundingClientRect().top;
      const factor = clamp((top + 100) / 800, 0, 1);

      for (const [index, cell] of cells.entries()) {
        const offset = offsets[index] ?? 0;
        cell.style.transform = `translateY(${offset * factor}px)`;
      }
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
  }, [offsets]);

  return (
    <div
      className="grid h-[50rem] cursor-pointer grid-cols-2 grid-rows-4 gap-4 py-7 md:h-[80rem] lg:h-[40rem] lg:grid-cols-4 lg:grid-rows-2 lg:gap-7 lg:py-16"
      ref={gridRef}
    >
      {children}
    </div>
  );
}
