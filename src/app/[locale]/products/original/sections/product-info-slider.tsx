"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Slide = {
  title: string;
  body: string;
};

const FRAME_COUNT = 251;
const LAST_FRAME = FRAME_COUNT - 1;
const CANVAS_WIDTH = 1126;
const CANVAS_HEIGHT = 880;
const PRELOAD_WINDOW = 25;
const SCROLL_OFFSET = 300;

function frameSrc(index: number) {
  return `/images/original-scroll/SCROLL_${String(index).padStart(5, "0")}.jpg`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function SkipIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="40"
      viewBox="0 0 41 40"
      width="41"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        className="fill-brand stroke-brand transition-[fill,stroke] duration-300 group-hover:fill-white"
        height="39"
        rx="19.5"
        width="40"
        x="0.5"
        y="0.5"
      />
      <path
        className="fill-white transition-colors duration-300 group-hover:fill-brand"
        d="M15.4764 25.405C15.3528 25.405 15.234 25.3575 15.139 25.2672C14.9537 25.0819 14.9537 24.7825 15.139 24.5972L25.5934 14.138C25.7787 13.9527 26.0781 13.9527 26.2634 14.138C26.4488 14.3233 26.4488 14.6227 26.2634 14.8081L15.8138 25.2672C15.7187 25.3622 15.5999 25.405 15.4764 25.405Z"
      />
      <path
        className="fill-white transition-colors duration-300 group-hover:fill-brand"
        d="M25.9308 25.405C25.8072 25.405 25.6884 25.3575 25.5934 25.2672L15.139 14.8128C14.9537 14.6275 14.9537 14.3233 15.139 14.138C15.3243 13.9527 15.6285 13.9527 15.8138 14.138L26.2682 24.5924C26.4535 24.7777 26.4535 25.0771 26.2682 25.2625C26.1731 25.3575 26.0543 25.4003 25.9308 25.4003V25.405Z"
      />
    </svg>
  );
}

function StopCard({ slide, index }: { slide: Slide; index: number }) {
  return (
    <div
      className="relative mt-2 border-grey border-t pt-4 opacity-50 transition-opacity duration-300 data-[active=true]:opacity-100"
      data-stop-card
      data-stop-index={index}
    >
      <div
        className="absolute top-[-2px] h-1 max-w-full rounded-full bg-brand"
        data-stop-bar
        data-stop-index={index}
        style={{ width: "0%" }}
      />
      <h3 className="mb-2 pt-2 pb-2 font-bold text-brand-dark leading-none md:mb-3">
        {slide.title}
      </h3>
      <p className="text-brand-dark text-rg">{slide.body}</p>
    </div>
  );
}

export function ProductInfoSlider({
  heading,
  skipLabel,
  slides,
}: {
  heading: string;
  skipLabel: string;
  slides: Slide[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const drawnFrameRef = useRef(-1);
  const targetFrameRef = useRef(0);
  const activeIndexRef = useRef(0);
  const progressRef = useRef(0);
  const pinnedRef = useRef(true);
  const releaseProgressRef = useRef(0);
  const releaseStartTopRef = useRef(0);
  const skipPanelTopRef = useRef(0);
  const didSkipRef = useRef(false);
  const skipAlignedRef = useRef(false);
  const progressFromScrollRef = useRef<() => number>(() => 0);
  const paintRef = useRef<(progress: number) => void>(() => {});
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const frames = framesRef.current;
    const stopCount = slides.length;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const preload = (from: number, count = PRELOAD_WINDOW) => {
      const end = Math.min(LAST_FRAME, from + count);
      for (let index = from; index <= end; index += 1) {
        if (frames[index]) {
          continue;
        }
        const image = new Image();
        image.src = frameSrc(index);
        frames[index] = image;
      }
    };

    const drawFrame = (index: number) => {
      targetFrameRef.current = index;
      const image = frames[index];
      if (!image) {
        return;
      }

      const paintIfCurrent = () => {
        if (
          targetFrameRef.current !== index ||
          !image.complete ||
          image.naturalWidth === 0
        ) {
          return;
        }
        if (drawnFrameRef.current === index) {
          return;
        }
        ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawnFrameRef.current = index;
      };

      if (image.complete) {
        paintIfCurrent();
        return;
      }

      image.addEventListener("load", paintIfCurrent, { once: true });
    };

    const updateStops = (progress: number) => {
      const cards = track.querySelectorAll<HTMLElement>("[data-stop-card]");
      const bars = track.querySelectorAll<HTMLElement>("[data-stop-bar]");

      for (const card of cards) {
        const index = Number(card.dataset.stopIndex);
        let local = (progress - index / stopCount) * stopCount;
        if (local < 0) {
          local = 0;
        }
        card.dataset.active = local > 0 && local < 1 ? "true" : "false";
        if (pinnedRef.current) {
          card.style.opacity = card.dataset.active === "true" ? "1" : "0.5";
        } else {
          card.style.removeProperty("opacity");
        }
      }

      for (const bar of bars) {
        const index = Number(bar.dataset.stopIndex);
        let local = (progress - index / stopCount) * stopCount;
        if (local < 0) {
          local = 0;
        }
        bar.style.width = `${clamp(local, 0, 1) * 100}%`;
      }

      const nextIndex = clamp(
        Math.floor(progress * stopCount - 0.0001),
        0,
        stopCount - 1,
      );
      if (nextIndex !== activeIndexRef.current && mobileTrackRef.current) {
        activeIndexRef.current = nextIndex;
        mobileTrackRef.current.style.transform = `translateX(-${nextIndex * 100}%)`;
      }
    };

    const progressFromScroll = () => {
      if (!pinnedRef.current) {
        const start = releaseProgressRef.current;
        if (!skipAlignedRef.current) {
          return start;
        }
        const travel = Math.max(1, track.offsetHeight);
        const passed =
          releaseStartTopRef.current - track.getBoundingClientRect().top;
        return clamp(start + (1 - start) * (passed / travel), 0, 1);
      }

      const top = track.getBoundingClientRect().top;
      const range = track.offsetHeight - window.innerHeight + SCROLL_OFFSET;
      const scrolled = -top + SCROLL_OFFSET;
      if (range <= 0) {
        return 0;
      }
      return clamp(scrolled / range, 0, 1);
    };

    const paint = (progress: number) => {
      progressRef.current = progress;
      const frame = Math.min(LAST_FRAME, Math.ceil(progress * LAST_FRAME));
      preload(frame);
      drawFrame(frame);
      updateStops(progress);
    };

    progressFromScrollRef.current = progressFromScroll;
    paintRef.current = paint;

    if (reduceMotion) {
      pinnedRef.current = false;
      setPinned(false);
      preload(LAST_FRAME, FRAME_COUNT);
      paint(1);
      return;
    }

    preload(0);
    paint(progressFromScroll());

    let frame = 0;
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          paint(progressFromScroll());
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [slides.length]);

  useLayoutEffect(() => {
    if (pinned || !didSkipRef.current) {
      return;
    }
    const panel = panelRef.current;
    const track = trackRef.current;
    if (!panel || !track) {
      return;
    }
    window.scrollBy(
      0,
      panel.getBoundingClientRect().top - skipPanelTopRef.current,
    );
    releaseStartTopRef.current = track.getBoundingClientRect().top;
    skipAlignedRef.current = true;
    paintRef.current(progressFromScrollRef.current());
  }, [pinned]);

  function handleSkip() {
    const track = trackRef.current;
    const panel = panelRef.current;
    if (!track || !panel || !pinnedRef.current) {
      return;
    }

    didSkipRef.current = true;
    skipAlignedRef.current = false;
    skipPanelTopRef.current = panel.getBoundingClientRect().top;
    releaseProgressRef.current = progressRef.current;
    releaseStartTopRef.current = skipPanelTopRef.current;
    pinnedRef.current = false;
    setPinned(false);

    const fromFrame = Math.ceil(progressRef.current * LAST_FRAME);
    const frames = framesRef.current;
    for (let index = fromFrame; index <= LAST_FRAME; index += 1) {
      if (frames[index]) {
        continue;
      }
      const image = new Image();
      image.src = frameSrc(index);
      frames[index] = image;
    }
  }

  return (
    <section
      className="relative h-fit bg-surface pt-12 [overflow-anchor:none] md:pt-16"
      id="product-info-slider"
    >
      <div
        className={cn(
          "relative [overflow-anchor:none] motion-reduce:h-fit",
          pinned ? "h-[5000px]" : "h-fit",
        )}
        ref={trackRef}
      >
        <div
          className={cn(
            "flex h-dvh flex-col overflow-hidden pt-0 pb-[88px] duration-300 motion-reduce:relative md:pb-24",
            pinned ? "sticky top-0" : "relative",
          )}
          ref={panelRef}
        >
          <div className="product-info-heading-row relative z-20 mx-auto flex w-full max-w-[720px] shrink-0 items-center justify-center text-center font-bold text-brand-dark lg:flex-col">
            <h2 className="product-info-heading">{heading}</h2>
            {pinned ? (
              <button
                aria-label={skipLabel}
                className="group z-20 hidden w-fit cursor-pointer lg:absolute lg:right-[-5rem] lg:bottom-0 lg:block"
                onClick={handleSkip}
                type="button"
              >
                <SkipIcon />
              </button>
            ) : null}
          </div>

          <canvas
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 mx-auto -mt-16 h-auto max-h-[80vh] w-auto max-w-full -translate-x-1/2 -translate-y-1/2"
            height={CANVAS_HEIGHT}
            ref={canvasRef}
            width={CANVAS_WIDTH}
          />
          <div className="min-h-0 flex-1" />

          <div className="hidden w-full shrink-0 px-10 pb-2 lg:block xl:mx-auto xl:max-w-[1440px]">
            <div
              className={cn(
                "relative z-20 flex gap-[50px] bg-surface/70 lg:[&>*]:flex-1",
                !pinned && "[&_[data-stop-card]]:hover:opacity-100",
              )}
            >
              {slides.map((slide, index) => (
                <StopCard index={index} key={slide.title} slide={slide} />
              ))}
            </div>
          </div>

          <div
            className={cn(
              "w-full shrink-0 overflow-hidden bg-surface/70 pb-2 lg:hidden",
              !pinned && "[&_[data-stop-card]]:hover:opacity-100",
            )}
          >
            <div
              className="flex duration-500 ease-out"
              ref={mobileTrackRef}
              style={{ transform: "translateX(0%)" }}
            >
              {slides.map((slide, index) => (
                <div className="w-full shrink-0 px-5" key={slide.title}>
                  <StopCard index={index} slide={slide} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
