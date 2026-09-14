"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { type PointerEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { staticImageUrl } from "@/lib/static-image-url";
import { cn } from "@/lib/utils";

export type LayerItem = {
  id: string;
  title: string;
  body: string;
  bodyExtra?: string;
  advantages?: string[];
  selectLabel: string;
  mediaAlt: string;
};

type SliceId =
  | "tencel"
  | "hypersupport"
  | "memoryFoam"
  | "coldFoamSoft"
  | "coldFoamFirm"
  | "nonSlip";

type Slice = {
  id: SliceId;
  src: string;
  width: number;
  height: number;
  hotspotX: string;
  hotspotTop?: string;
};

const SLICES: Slice[] = [
  {
    id: "tencel",
    src: "/images/product-layers/laag1.webp",
    width: 2300,
    height: 210,
    hotspotX: "20%",
  },
  {
    id: "memoryFoam",
    src: "/images/product-layers/laag3.webp",
    width: 2300,
    height: 130,
    hotspotX: "12%",
  },
  {
    id: "hypersupport",
    src: "/images/product-layers/laag2.webp",
    width: 2300,
    height: 130,
    hotspotX: "30%",
  },
  {
    id: "coldFoamSoft",
    src: "/images/product-layers/laag4.webp",
    width: 2300,
    height: 175,
    hotspotX: "30%",
  },
  {
    id: "coldFoamFirm",
    src: "/images/product-layers/laag5.webp",
    width: 2300,
    height: 160,
    hotspotX: "20%",
  },
  {
    id: "nonSlip",
    src: "/images/product-layers/laag6.webp",
    width: 2300,
    height: 290,
    hotspotX: "10%",
    hotspotTop: "92%",
  },
];

const EXTRA_HOTSPOTS = [
  { id: "cover", sliceId: "nonSlip", x: "24%", top: "42%" },
] as const;

const NAV_IDS = [
  "tencel",
  "memoryFoam",
  "hypersupport",
  "coldFoamSoft",
  "coldFoamFirm",
  "nonSlip",
  "cover",
] as const;

function layerVideo(name: string) {
  return {
    type: "video" as const,
    src: `/images/product-layers/${name}.mp4`,
    poster: `/images/product-layers/${name}.webp`,
  };
}

const MEDIA: Record<
  string,
  | { type: "video"; src: string; poster: string }
  | { type: "image"; src: string }
  | undefined
> = {
  tencel: layerVideo("tencel"),
  hypersupport: layerVideo("hypersupport"),
  memoryFoam: layerVideo("memory-foam"),
  coldFoamSoft: layerVideo("cold-foam-soft"),
  coldFoamFirm: layerVideo("cold-foam-firm"),
  nonSlip: { type: "image", src: "/images/product-layers/non-slip.jpg" },
  cover: { type: "image", src: "/images/product-layers/cover.jpg" },
};

const SLICE_MID = (SLICES.length - 1) / 2;
const PACK_DISTANCE = 32;
const DESKTOP_MQ = "(min-width: 1024px)";

const expandSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 15,
  mass: 0.85,
};

const hoverSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 16,
  mass: 0.7,
};

const panelTransition = {
  type: "tween" as const,
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1] as const,
};

const sheetSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

const slideTransition = {
  type: "tween" as const,
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1] as const,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "28%" : "-28%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-28%" : "28%",
    opacity: 0,
  }),
};

function packedY(index: number) {
  return (index - SLICE_MID) * -PACK_DISTANCE;
}

function isDesktopViewport() {
  return window.matchMedia(DESKTOP_MQ).matches;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function Hotspot({
  active,
  label,
  onSelect,
  top = "42%",
  visible,
  x,
}: {
  active: boolean;
  label: string;
  onSelect: () => void;
  top?: string;
  visible: boolean;
  x: string;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "absolute z-30 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white outline-none transition-[opacity,background-color] duration-300 [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-brand",
        visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
        active ? "bg-brand/50" : "bg-grey/30 hover:bg-brand/50",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      style={{ left: x, top }}
      type="button"
    >
      <span
        className={cn(
          "layers-hotspot-ring pointer-events-none absolute inset-0 rounded-full",
          active ? "bg-brand/20" : "",
        )}
      />
      <span
        className={cn(
          "layers-hotspot-dot size-2.5 rounded-full",
          active ? "bg-brand" : "bg-white",
        )}
      />
    </button>
  );
}

function LayerMedia({
  className,
  item,
  shouldAutoPlay = false,
}: {
  className?: string;
  item: LayerItem;
  shouldAutoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const media = MEDIA[item.id];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldAutoPlay) {
      return;
    }

    const play = () => {
      void video.play().catch(() => {});
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      play();
      return;
    }

    video.addEventListener("canplay", play);
    return () => video.removeEventListener("canplay", play);
  }, [shouldAutoPlay]);

  if (!media) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden bg-brand-muted", className)}>
      {media.type === "video" ? (
        <>
          {/* biome-ignore lint/performance/noImgElement: tiny static poster, skip the image optimizer */}
          <img
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover"
            decoding="async"
            fetchPriority={shouldAutoPlay ? "high" : "low"}
            src={staticImageUrl(media.poster)}
          />
          <video
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-300",
              playing ? "opacity-100" : "opacity-0",
            )}
            loop
            muted
            onPlaying={() => setPlaying(true)}
            playsInline
            poster={staticImageUrl(media.poster)}
            preload={shouldAutoPlay ? "auto" : "none"}
            ref={videoRef}
            src={staticImageUrl(media.src)}
          />
        </>
      ) : (
        <Image
          alt={item.mediaAlt}
          className="h-full w-full object-cover"
          height={352}
          src={media.src}
          width={710}
        />
      )}
    </div>
  );
}

function LayerCopy({
  advantagesLabel,
  item,
  titleId,
}: {
  advantagesLabel: string;
  item: LayerItem;
  titleId?: string;
}) {
  return (
    <div className="product-detail-content mb-0">
      <h3
        className="text-balance font-bold text-[1.75rem] text-brand-dark leading-[1.15] tracking-heading md:text-[2.25rem] md:leading-none"
        id={titleId}
      >
        {item.title}
      </h3>
      <p>{item.body}</p>
      {item.bodyExtra ? <p>{item.bodyExtra}</p> : null}
      {item.advantages?.length ? (
        <>
          <p>
            <strong>{advantagesLabel}</strong>
          </p>
          <ul>
            {item.advantages.map((advantage) => (
              <li key={advantage}>{advantage}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function LayerPopup({
  advantagesLabel,
  closeLabel,
  direction,
  index,
  isOpen,
  item,
  navItems,
  nextLabel,
  onClose,
  onJump,
  onNext,
  onPrev,
  previousLabel,
  reduceMotion,
  total,
}: {
  advantagesLabel: string;
  closeLabel: string;
  direction: number;
  index: number;
  isOpen: boolean;
  item: LayerItem | undefined;
  navItems: LayerItem[];
  nextLabel: string;
  onClose: () => void;
  onJump: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
  previousLabel: string;
  reduceMotion: boolean | null;
  total: number;
}) {
  const titleId = useId();
  const swipeRef = useRef<{
    axis: "x" | "y" | null;
    time: number;
    x: number;
    y: number;
  } | null>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        onNext();
      } else if (event.key === "ArrowLeft") {
        onPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev]);

  useEffect(() => {
    const node = sheetRef.current;
    if (!isOpen || !node) {
      return;
    }

    const onTouchMove = (event: TouchEvent) => {
      const swipe = swipeRef.current;
      const touch = event.touches[0];
      if (!swipe || !touch) {
        return;
      }
      if (!swipe.axis) {
        const dx = touch.clientX - swipe.x;
        const dy = touch.clientY - swipe.y;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          return;
        }
        swipe.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (swipe.axis === "x") {
        event.preventDefault();
      }
    };

    node.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => node.removeEventListener("touchmove", onTouchMove);
  }, [isOpen]);

  function onSwipePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.button !== 0) {
      return;
    }
    if ((event.target as HTMLElement | null)?.closest("button, a, input")) {
      return;
    }
    swipeRef.current = {
      axis: null,
      time: event.timeStamp,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function onSwipePointerMove(event: PointerEvent<HTMLDivElement>) {
    const swipe = swipeRef.current;
    if (!swipe || swipe.axis) {
      return;
    }
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      return;
    }
    swipe.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  }

  function onSwipePointerUp(event: PointerEvent<HTMLDivElement>) {
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe || swipe.axis === "y" || reduceMotion) {
      return;
    }
    const dx = event.clientX - swipe.x;
    const velocity = dx / Math.max(1, event.timeStamp - swipe.time);
    if (dx < -48 || velocity < -0.45) {
      onNext();
    } else if (dx > 48 || velocity > 0.45) {
      onPrev();
    }
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && item ? (
        <div className="fixed inset-0 z-[2000] lg:hidden" key="layer-popup">
          <motion.button
            aria-label={closeLabel}
            className="absolute inset-0 cursor-pointer bg-brand-dark/40 backdrop-blur-[8px] supports-[backdrop-filter]:bg-brand-dark/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.28 }}
            type="button"
          />

          <motion.aside
            aria-labelledby={titleId}
            aria-modal="true"
            className="absolute inset-x-0 bottom-0 flex h-[min(86dvh,42rem)] flex-col overflow-hidden rounded-t-[2rem] bg-white text-brand-dark shadow-[0_-24px_80px_rgba(26,71,138,0.22)]"
            initial={reduceMotion ? false : { y: "110%" }}
            animate={{ y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "110%" }}
            ref={sheetRef}
            role="dialog"
            transition={reduceMotion ? { duration: 0 } : sheetSpring}
          >
            <div className="pointer-events-none absolute top-2.5 left-1/2 z-30 h-1 w-10 -translate-x-1/2 rounded-full bg-brand-dark/20" />

            <button
              aria-label={closeLabel}
              className="absolute top-4 right-4 z-30 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-brand-dark shadow-md backdrop-blur-sm"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </button>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <AnimatePresence custom={direction} initial={false} mode="sync">
                <motion.div
                  animate="center"
                  className="absolute inset-0 flex flex-col"
                  custom={direction}
                  exit="exit"
                  initial="enter"
                  key={item.id}
                  transition={reduceMotion ? { duration: 0 } : slideTransition}
                  variants={slideVariants}
                >
                  <div
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-14 pb-2"
                    onPointerCancel={() => {
                      swipeRef.current = null;
                    }}
                    onPointerDown={onSwipePointerDown}
                    onPointerMove={onSwipePointerMove}
                    onPointerUp={onSwipePointerUp}
                  >
                    <LayerMedia
                      className="mb-5 aspect-16/10 w-3/5 rounded-3xl"
                      item={item}
                      shouldAutoPlay={true}
                    />
                    <p className="mb-2 font-medium text-brand text-xs uppercase tracking-[0.18em]">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(total).padStart(2, "0")}
                    </p>
                    <LayerCopy
                      advantagesLabel={advantagesLabel}
                      item={item}
                      titleId={titleId}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-brand-dark/10 border-t px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <button
                aria-label={previousLabel}
                className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(26,71,138,0.28)] transition-transform active:scale-95"
                onClick={onPrev}
                type="button"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className="size-6"
                  strokeWidth={1.75}
                />
              </button>

              <div className="flex items-center gap-1.5">
                {navItems.map((navItem) => (
                  <button
                    aria-current={navItem.id === item.id}
                    aria-label={navItem.selectLabel}
                    className={cn(
                      "h-1.5 cursor-pointer rounded-full transition-[width,background-color] duration-300",
                      navItem.id === item.id
                        ? "w-6 bg-brand"
                        : "w-1.5 bg-brand-dark/20",
                    )}
                    key={navItem.id}
                    onClick={() => onJump(navItem.id)}
                    type="button"
                  />
                ))}
              </div>

              <button
                aria-label={nextLabel}
                className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(26,71,138,0.28)] transition-transform active:scale-95"
                onClick={onNext}
                type="button"
              >
                <ChevronRight
                  aria-hidden="true"
                  className="size-6"
                  strokeWidth={1.75}
                />
              </button>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function ProductLayers({
  advantagesLabel,
  className,
  closeLabel,
  heading,
  items,
  nextLabel,
  previousLabel,
}: {
  advantagesLabel: string;
  className?: string;
  closeLabel: string;
  heading: string;
  items: LayerItem[];
  nextLabel: string;
  previousLabel: string;
}) {
  const headingId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [direction, setDirection] = useState(1);

  const itemById = new Map(items.map((item) => [item.id, item]));
  const navItems = NAV_IDS.flatMap((id) => {
    const item = itemById.get(id);
    return item ? [item] : [];
  });
  const selected = selectedId ? itemById.get(selectedId) : undefined;
  const selectedIndex = Math.max(
    0,
    navItems.findIndex((item) => item.id === selectedId),
  );
  const hotspotsReady = expanded || Boolean(reduceMotion);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    if (reduceMotion) {
      setExpanded(true);
      return;
    }

    let start: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        io.disconnect();
        start = window.setTimeout(() => setExpanded(true), 280);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.2 },
    );

    io.observe(root);
    return () => {
      io.disconnect();
      if (start) {
        window.clearTimeout(start);
      }
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!expanded || selectedId || !isDesktop) {
      return;
    }
    const delay = reduceMotion ? 0 : 720;
    const timer = window.setTimeout(() => setSelectedId("tencel"), delay);
    return () => window.clearTimeout(timer);
  }, [expanded, isDesktop, reduceMotion, selectedId]);

  useEffect(() => {
    if (isDesktop) {
      setPopupOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (!expanded) {
      return;
    }
    for (const asset of Object.values(MEDIA)) {
      if (asset?.type !== "video") {
        continue;
      }
      const preload = new window.Image();
      preload.src = staticImageUrl(asset.poster);
    }
  }, [expanded]);

  function select(id: string, nextDirection = 1) {
    setDirection(nextDirection);
    setSelectedId(id);
    if (!isDesktopViewport()) {
      setPopupOpen(true);
    }
  }

  function step(delta: number) {
    if (navItems.length === 0) {
      return;
    }
    const nextIndex =
      (selectedIndex + delta + navItems.length) % navItems.length;
    select(navItems[nextIndex].id, delta);
  }

  function jumpTo(id: string) {
    const nextIndex = navItems.findIndex((item) => item.id === id);
    select(id, nextIndex >= selectedIndex ? 1 : -1);
  }

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col overflow-x-clip bg-brand-muted py-16 pb-28 lg:pt-24 lg:pb-16",
        className,
      )}
      id="product-layers"
      ref={rootRef}
    >
      <div className="mx-auto w-full max-w-[1440px] overflow-x-visible">
        <h2
          className="reveal heading mb-12 shrink-0 px-5 py-4 text-center text-brand-dark lg:mb-16 lg:py-6"
          id={headingId}
        >
          {heading}
        </h2>

        <div className="relative flex flex-col items-stretch gap-8 overflow-x-visible px-5 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-20 lg:px-10 xl:gap-28 xl:px-16">
          <div className="relative z-10 hidden lg:block">
            <div className="grid">
              {navItems.map((item) => {
                const active = selected?.id === item.id;
                return (
                  <motion.div
                    animate={{ opacity: active ? 1 : 0 }}
                    aria-hidden={!active}
                    className="col-start-1 row-start-1"
                    inert={!active ? true : undefined}
                    initial={false}
                    key={item.id}
                    style={{ pointerEvents: active ? "auto" : "none" }}
                    transition={
                      reduceMotion ? { duration: 0 } : panelTransition
                    }
                  >
                    <div className="flex flex-col pr-1">
                      <LayerCopy
                        advantagesLabel={advantagesLabel}
                        item={item}
                      />
                      {active ? (
                        <LayerMedia
                          className="mt-3 aspect-video w-full shrink-0 rounded-[28px] lg:rounded-[40px]"
                          item={item}
                          shouldAutoPlay={true}
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="mt-3 aspect-video w-full shrink-0"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="relative z-20 overflow-x-visible">
            <div className="product-layers-stack w-[155%] max-w-none shrink-0 select-none lg:w-[60vw]">
              {SLICES.map((slice, index) => {
                const extras = EXTRA_HOTSPOTS.filter(
                  (hotspot) => hotspot.sliceId === slice.id,
                );
                const highlighted =
                  selectedId === slice.id ||
                  extras.some((hotspot) => hotspot.id === selectedId);
                const sliceItem = itemById.get(slice.id);
                const coverItem =
                  slice.id === "nonSlip" ? itemById.get("cover") : undefined;

                return (
                  <motion.div
                    animate={{
                      x: highlighted ? -18 : 0,
                      y: expanded || reduceMotion ? 0 : packedY(index),
                    }}
                    className="relative"
                    key={slice.id}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            y: {
                              ...expandSpring,
                              delay: expanded
                                ? Math.abs(index - SLICE_MID) * 0.045
                                : 0,
                            },
                            x: hoverSpring,
                          }
                    }
                    whileHover={
                      reduceMotion || !expanded || !isDesktop
                        ? undefined
                        : { x: -18, transition: hoverSpring }
                    }
                  >
                    <div className="relative z-10">
                      <Image
                        alt=""
                        className="relative z-10 h-auto w-full"
                        draggable={false}
                        height={slice.height}
                        loading="lazy"
                        sizes="(min-width: 1024px) 60vw, 155vw"
                        src={slice.src}
                        width={slice.width}
                      />
                      {slice.id === "nonSlip" && coverItem && sliceItem ? (
                        <>
                          <button
                            aria-label={coverItem.selectLabel}
                            className="absolute inset-x-0 top-0 z-20 h-[75%] cursor-pointer bg-transparent outline-none [-webkit-tap-highlight-color:transparent]"
                            onClick={() => select("cover")}
                            tabIndex={-1}
                            type="button"
                          />
                          <button
                            aria-label={sliceItem.selectLabel}
                            className="absolute inset-x-0 bottom-0 z-[21] h-[32%] cursor-pointer bg-transparent outline-none [-webkit-tap-highlight-color:transparent]"
                            onClick={() => select("nonSlip")}
                            tabIndex={-1}
                            type="button"
                          />
                        </>
                      ) : (
                        <button
                          aria-label={sliceItem?.selectLabel ?? slice.id}
                          className="absolute inset-0 z-20 cursor-pointer bg-transparent outline-none [-webkit-tap-highlight-color:transparent]"
                          onClick={() => select(slice.id)}
                          tabIndex={-1}
                          type="button"
                        />
                      )}
                    </div>

                    {slice.id === "nonSlip" ? (
                      <Image
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute top-[125%] left-0 z-0 h-auto w-full"
                        height={255}
                        loading="lazy"
                        src="/images/product-layers/laag7.webp"
                        width={2300}
                      />
                    ) : null}

                    <Hotspot
                      active={selectedId === slice.id}
                      label={sliceItem?.selectLabel ?? slice.id}
                      onSelect={() => select(slice.id)}
                      top={slice.hotspotTop}
                      visible={hotspotsReady}
                      x={slice.hotspotX}
                    />

                    {extras.map((hotspot) => {
                      const extraItem = itemById.get(hotspot.id);
                      return (
                        <Hotspot
                          active={selectedId === hotspot.id}
                          key={hotspot.id}
                          label={extraItem?.selectLabel ?? hotspot.id}
                          onSelect={() => select(hotspot.id)}
                          top={hotspot.top}
                          visible={hotspotsReady}
                          x={hotspot.x}
                        />
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <LayerPopup
        advantagesLabel={advantagesLabel}
        closeLabel={closeLabel}
        direction={direction}
        index={selectedIndex}
        isOpen={popupOpen}
        item={selected}
        navItems={navItems}
        nextLabel={nextLabel}
        onClose={() => setPopupOpen(false)}
        onJump={jumpTo}
        onNext={() => step(1)}
        onPrev={() => step(-1)}
        previousLabel={previousLabel}
        reduceMotion={reduceMotion}
        total={navItems.length}
      />
    </section>
  );
}
