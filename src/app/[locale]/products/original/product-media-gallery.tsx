"use client";

import { Pause, Play } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { staticImageUrl } from "@/lib/static-image-url";
import { cn } from "@/lib/utils";

const GALLERY = {
  hero: "/images/product-gallery/hero-square.png",
  packshot: "/images/product-gallery/packshot.jpg",
  lifestyle: "/images/product-gallery/lifestyle.jpg",
  benefits: "/images/product-gallery/benefits.jpg",
  layersVideo: "/images/product-gallery/layers-animation.mp4",
  layersThumb: "/images/configurator/section.png",
} as const;

type SlideId = "hero" | "packshot" | "lifestyle" | "layers" | "benefits";

type Slide = {
  id: SlideId;
  type: "image" | "video";
  src: string;
  thumb: string;
  altKey:
    | "heroAlt"
    | "packshotAlt"
    | "lifestyleAlt"
    | "benefitsAlt"
    | "layersAlt";
  objectPosition?: string;
};

const SLIDES: Slide[] = [
  {
    id: "hero",
    type: "image",
    src: GALLERY.hero,
    thumb: GALLERY.hero,
    altKey: "heroAlt",
  },
  {
    id: "packshot",
    type: "image",
    src: GALLERY.packshot,
    thumb: GALLERY.packshot,
    altKey: "packshotAlt",
  },
  {
    id: "lifestyle",
    type: "image",
    src: GALLERY.lifestyle,
    thumb: GALLERY.lifestyle,
    altKey: "lifestyleAlt",
  },
  {
    id: "layers",
    type: "video",
    src: GALLERY.layersVideo,
    thumb: GALLERY.layersThumb,
    altKey: "layersAlt",
  },
  {
    id: "benefits",
    type: "image",
    src: GALLERY.benefits,
    thumb: GALLERY.benefits,
    altKey: "benefitsAlt",
    objectPosition: "object-top",
  },
];

const slideTransition = {
  type: "tween" as const,
  duration: 0.42,
  ease: [0.32, 0.72, 0, 1] as const,
};

const barTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.8,
};

const mainSlideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? "100%" : "-100%",
  }),
  center: { x: 0 },
  exit: (direction: number) => ({
    x: direction >= 0 ? "-100%" : "100%",
  }),
};

function slideDirection(fromId: SlideId, toId: SlideId) {
  const from = SLIDES.findIndex((slide) => slide.id === fromId);
  const to = SLIDES.findIndex((slide) => slide.id === toId);
  if (from === SLIDES.length - 1 && to === 0) return 1;
  if (from === 0 && to === SLIDES.length - 1) return -1;
  return to >= from ? 1 : -1;
}

function LayersVideo({
  pauseLabel,
  playLabel,
  className,
}: {
  pauseLabel: string;
  playLabel: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div className={cn("relative overflow-hidden bg-[#f0f0f0]", className)}>
      <video
        autoPlay
        className="absolute inset-0 size-full object-cover"
        loop
        muted
        playsInline
        ref={videoRef}
        src={staticImageUrl(GALLERY.layersVideo)}
      />

      <button
        aria-label={playing ? pauseLabel : playLabel}
        className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
        onClick={togglePlayback}
        type="button"
      >
        {playing ? (
          <Pause className="size-3.5 fill-current" strokeWidth={0} />
        ) : (
          <Play className="ml-0.5 size-3.5 fill-current" strokeWidth={0} />
        )}
      </button>
    </div>
  );
}

function GalleryTile({
  src,
  alt,
  priority,
  objectPosition = "object-center",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  return (
    <div className="relative aspect-390/488 overflow-hidden bg-surface">
      <Image
        alt={alt}
        className={`object-cover ${objectPosition}`}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 28vw, 50vw"
        src={staticImageUrl(src)}
      />
    </div>
  );
}

function ZoomButton({ label }: { label: string }) {
  return (
    <button
      aria-label={label}
      className="absolute right-4 bottom-4 z-10 flex size-10 items-center justify-center rounded-full border border-grey bg-white sm:right-5 sm:bottom-5"
      type="button"
    >
      <svg
        aria-hidden="true"
        className="size-4 text-brand-dark"
        fill="none"
        viewBox="0 0 18 18"
      >
        <circle
          cx="7.5"
          cy="7.5"
          r="5.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M11.5 11.5L16 16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <path
          d="M7.5 5.25V9.75M5.25 7.5H9.75"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}

const AUTOPLAY_MS = 5000;
const CLICK_PAUSE_MS = 7000;

function MobileGallery({ awardAlt }: { awardAlt: string }) {
  const t = useTranslations("productOriginal.hero.gallery");
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<SlideId>("hero");
  const [direction, setDirection] = useState(1);
  const pauseAutoplayRef = useRef<() => void>(() => {});
  const active = SLIDES.find((slide) => slide.id === activeId) ?? SLIDES[0];
  const duration = reduceMotion ? 0 : slideTransition.duration;

  function goTo(nextId: SlideId) {
    if (nextId !== activeId) {
      setDirection(slideDirection(activeId, nextId));
      setActiveId(nextId);
    }
    pauseAutoplayRef.current();
  }

  useEffect(() => {
    if (reduceMotion) {
      pauseAutoplayRef.current = () => {};
      return;
    }

    let timer: number | null = null;

    function clear() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    function schedule(delayMs: number) {
      clear();
      timer = window.setTimeout(() => {
        setDirection(1);
        setActiveId((current) => {
          const index = SLIDES.findIndex((slide) => slide.id === current);
          return SLIDES[(index + 1) % SLIDES.length]?.id ?? "hero";
        });
        schedule(AUTOPLAY_MS);
      }, delayMs);
    }

    pauseAutoplayRef.current = () => schedule(CLICK_PAUSE_MS);
    schedule(AUTOPLAY_MS);

    return () => {
      clear();
      pauseAutoplayRef.current = () => {};
    };
  }, [reduceMotion]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative w-full overflow-hidden bg-surface pt-[100%]">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            animate="center"
            className="absolute inset-0"
            custom={direction}
            exit="exit"
            initial="enter"
            key={active.id}
            transition={{ ...slideTransition, duration }}
            variants={mainSlideVariants}
          >
            {active.type === "video" ? (
              <LayersVideo
                className="absolute inset-0 size-full"
                pauseLabel={t("pauseAnimation")}
                playLabel={t("playAnimation")}
              />
            ) : (
              <Image
                alt={t(active.altKey)}
                className={cn(
                  "object-cover",
                  active.objectPosition ?? "object-center",
                )}
                fill
                priority={active.id === "hero"}
                sizes="100vw"
                src={staticImageUrl(active.src)}
              />
            )}

            {active.id === "hero" ? (
              <div className="pointer-events-none absolute top-0 left-4 z-10 w-24">
                <Image
                  alt={awardAlt}
                  className="h-auto w-full"
                  height={192}
                  src={staticImageUrl("/images/13-time-award.png")}
                  width={112}
                />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {active.type === "image" ? (
          <ZoomButton label={t("zoomLabel")} />
        ) : null}
      </div>

      <div className="relative px-5 pb-1">
        <LayoutGroup id="mobile-gallery-thumbs">
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {SLIDES.map((slide) => {
              const selected = slide.id === activeId;
              return (
                <button
                  aria-current={selected ? "true" : undefined}
                  aria-label={t(slide.altKey)}
                  className="relative w-18 shrink-0 cursor-pointer pb-2"
                  key={slide.id}
                  onClick={() => goTo(slide.id)}
                  type="button"
                >
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-surface">
                    <Image
                      alt=""
                      className={cn(
                        "object-cover",
                        slide.objectPosition ?? "object-center",
                      )}
                      fill
                      sizes="72px"
                      src={staticImageUrl(slide.thumb)}
                    />
                  </span>
                  {selected ? (
                    <motion.span
                      className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand"
                      layoutId="mobile-gallery-active-bar"
                      transition={
                        reduceMotion ? { duration: 0 } : barTransition
                      }
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}

function DesktopGallery({ awardAlt }: { awardAlt: string }) {
  const t = useTranslations("productOriginal.hero.gallery");

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative w-full bg-surface pt-[100%]">
        <Image
          alt={t("heroAlt")}
          className="object-cover object-center"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          src={staticImageUrl(GALLERY.hero)}
        />

        <div className="pointer-events-none absolute top-0 left-5 z-10 w-28 lg:left-10">
          <Image
            alt={awardAlt}
            className="h-auto w-full"
            height={192}
            priority
            src={staticImageUrl("/images/13-time-award.png")}
            width={112}
          />
        </div>

        <ZoomButton label={t("zoomLabel")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GalleryTile alt={t("packshotAlt")} priority src={GALLERY.packshot} />
        <GalleryTile alt={t("lifestyleAlt")} src={GALLERY.lifestyle} />
        <LayersVideo
          className="aspect-390/488"
          pauseLabel={t("pauseAnimation")}
          playLabel={t("playAnimation")}
        />
        <GalleryTile
          alt={t("benefitsAlt")}
          objectPosition="object-top"
          src={GALLERY.benefits}
        />
      </div>
    </div>
  );
}

export function ProductMediaGallery({ awardAlt }: { awardAlt: string }) {
  return (
    <>
      <div className="lg:hidden">
        <MobileGallery awardAlt={awardAlt} />
      </div>
      <div className="hidden lg:block">
        <DesktopGallery awardAlt={awardAlt} />
      </div>
    </>
  );
}
