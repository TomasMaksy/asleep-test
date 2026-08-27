"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    src: "/images/product-layers/laag1.png",
    width: 2300,
    height: 210,
    hotspotX: "20%",
  },
  {
    id: "hypersupport",
    src: "/images/product-layers/laag2.png",
    width: 2300,
    height: 130,
    hotspotX: "30%",
  },
  {
    id: "memoryFoam",
    src: "/images/product-layers/laag3.png",
    width: 2300,
    height: 130,
    hotspotX: "12%",
  },
  {
    id: "coldFoamSoft",
    src: "/images/product-layers/laag4.png",
    width: 2300,
    height: 175,
    hotspotX: "30%",
  },
  {
    id: "coldFoamFirm",
    src: "/images/product-layers/laag5.png",
    width: 2300,
    height: 160,
    hotspotX: "20%",
  },
  {
    id: "nonSlip",
    src: "/images/product-layers/laag6.png",
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
  "hypersupport",
  "memoryFoam",
  "coldFoamSoft",
  "coldFoamFirm",
  "nonSlip",
  "cover",
] as const;

const MEDIA: Record<
  string,
  { type: "video" | "image"; src: string } | undefined
> = {
  tencel: { type: "video", src: "/images/product-layers/tencel.mp4" },
  hypersupport: {
    type: "video",
    src: "/images/product-layers/hypersupport.mp4",
  },
  memoryFoam: { type: "video", src: "/images/product-layers/memory-foam.mp4" },
  coldFoamSoft: {
    type: "video",
    src: "/images/product-layers/cold-foam-soft.mp4",
  },
  coldFoamFirm: {
    type: "video",
    src: "/images/product-layers/cold-foam-firm.mp4",
  },
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
        "absolute z-30 flex size-[26px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white outline-none transition-[opacity,background-color] duration-300 [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-brand",
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
          "layers-hotspot-dot size-2 rounded-full",
          active ? "bg-brand" : "bg-white",
        )}
      />
    </button>
  );
}

function LayerMedia({
  className,
  item,
}: {
  className?: string;
  item: LayerItem;
}) {
  const media = MEDIA[item.id];
  if (!media) {
    return null;
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      {media.type === "video" ? (
        <video
          autoPlay
          className="h-full w-full object-cover"
          key={item.id}
          loop
          muted
          playsInline
        >
          <source src={media.src} type="video/mp4" />
        </video>
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

function LayerPanel({
  advantagesLabel,
  item,
}: {
  advantagesLabel: string;
  item: LayerItem;
}) {
  return (
    <div className="flex flex-col pr-1">
      <LayerCopy advantagesLabel={advantagesLabel} item={item} />
      <LayerMedia
        className="mt-3 aspect-video w-full shrink-0 rounded-[28px] lg:rounded-[40px]"
        item={item}
      />
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
  const dragControls = useDragControls();
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

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (reduceMotion) {
      return;
    }
    if (info.offset.x < -48 || info.velocity.x < -500) {
      onNext();
    } else if (info.offset.x > 48 || info.velocity.x > 500) {
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
                  drag={reduceMotion ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragControls={dragControls}
                  dragElastic={0.16}
                  dragListener={false}
                  exit="exit"
                  initial="enter"
                  key={item.id}
                  onDragEnd={onDragEnd}
                  transition={reduceMotion ? { duration: 0 } : slideTransition}
                  variants={slideVariants}
                >
                  <motion.div
                    className="shrink-0 touch-none"
                    onPointerDown={(event) => {
                      if (!reduceMotion) {
                        dragControls.start(event);
                      }
                    }}
                  >
                    <LayerMedia
                      className="aspect-[16/10] w-full shrink-0"
                      item={item}
                    />
                  </motion.div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-2">
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
  closeLabel,
  heading,
  items,
  nextLabel,
  previousLabel,
}: {
  advantagesLabel: string;
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
      className="flex flex-col overflow-x-hidden bg-brand-muted py-12 pb-28 lg:py-8 lg:pb-10"
      id="product-layers"
      ref={rootRef}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        <h2
          className="reveal heading mb-8 shrink-0 px-5 text-center text-brand-dark lg:mb-6"
          id={headingId}
        >
          {heading}
        </h2>

        <div className="relative flex flex-col items-stretch gap-8 px-5 lg:flex-row lg:items-start lg:gap-10 lg:px-10 xl:px-16">
          <div className="relative z-10 hidden w-[40%] shrink-0 lg:block">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  initial={reduceMotion ? false : { opacity: 0, x: -48 }}
                  key={selected.id}
                  transition={reduceMotion ? { duration: 0 } : panelTransition}
                >
                  <LayerPanel
                    advantagesLabel={advantagesLabel}
                    item={selected}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="relative z-20 flex w-full items-start justify-start overflow-visible lg:w-[60%]">
            <div className="product-layers-stack w-[160%] max-w-none select-none lg:w-[56rem] xl:w-[64rem] 2xl:w-[72rem]">
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
                        sizes="(min-width: 2000px) 72rem, (min-width: 1440px) 64rem, (min-width: 1024px) 56rem, 160vw"
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
                        src="/images/product-layers/laag7.png"
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
