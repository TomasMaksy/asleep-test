"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { staticImageUrl } from "@/lib/static-image-url";
import { cn } from "@/lib/utils";

export type GalleryLightboxItem = {
  id: string;
  type: "image" | "video";
  src: string;
  alt: string;
  poster?: string;
  objectPosition?: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export const galleryChromeButtonClassName =
  "flex cursor-pointer items-center justify-center rounded-full border border-grey bg-white text-brand-dark transition-colors hover:border-brand hover:bg-brand hover:text-white";

type ProductGalleryLightboxProps = {
  closeLabel: string;
  images: GalleryLightboxItem[];
  index: number;
  nextLabel: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  previousLabel: string;
  renderVideo: (item: GalleryLightboxItem) => ReactNode;
  title: string;
};

export function ProductGalleryLightbox({
  closeLabel,
  images,
  index,
  nextLabel,
  onClose,
  onIndexChange,
  previousLabel,
  renderVideo,
  title,
}: ProductGalleryLightboxProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const indexRef = useRef(index);
  const onIndexChangeRef = useRef(onIndexChange);
  const imagesRef = useRef(images);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const panRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef(0);

  const item = images[index];
  const count = images.length;
  onCloseRef.current = onClose;
  indexRef.current = index;
  onIndexChangeRef.current = onIndexChange;
  imagesRef.current = images;

  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function goBy(delta: number) {
      const total = imagesRef.current.length;
      if (total < 2) {
        return;
      }
      setScale(1);
      setPan({ x: 0, y: 0 });
      onIndexChangeRef.current((indexRef.current + delta + total) % total);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key === "ArrowLeft") {
        goBy(-1);
      }
      if (event.key === "ArrowRight") {
        goBy(1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!item || typeof document === "undefined") {
    return null;
  }

  function goBy(delta: number) {
    if (count < 2) {
      return;
    }
    setScale(1);
    setPan({ x: 0, y: 0 });
    onIndexChange((index + delta + count) % count);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      if (first && second) {
        pinchRef.current = {
          distance: Math.hypot(first.x - second.x, first.y - second.y),
          scale,
        };
      }
      panRef.current = null;
      swipeRef.current = null;
      return;
    }

    if (scale > 1) {
      panRef.current = {
        x: event.clientX,
        y: event.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      swipeRef.current = null;
      return;
    }

    swipeRef.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      // Crushed gallery videos look worse when upscaled — keep them 1×.
      if (item?.type === "video") {
        return;
      }
      const [first, second] = [...pointersRef.current.values()];
      if (!first || !second) {
        return;
      }
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      const next = clamp(
        (pinchRef.current.scale * distance) / pinchRef.current.distance,
        MIN_SCALE,
        MAX_SCALE,
      );
      setScale(next);
      if (next === MIN_SCALE) {
        setPan({ x: 0, y: 0 });
      }
      return;
    }

    if (panRef.current && scale > 1) {
      setPan({
        x: panRef.current.panX + event.clientX - panRef.current.x,
        y: panRef.current.panY + event.clientY - panRef.current.y,
      });
    }
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeRef.current;
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    panRef.current = null;

    if (start && scale === 1 && pointersRef.current.size === 0) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        goBy(dx < 0 ? 1 : -1);
      }
    }
    swipeRef.current = null;
  }

  function onDoubleTap(event: ReactPointerEvent<HTMLDivElement>) {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      event.preventDefault();
      swipeRef.current = null;
      if (item?.type === "video") {
        lastTapRef.current = now;
        return;
      }
      setScale((current) => {
        const next = current > 1 ? 1 : 2;
        if (next === 1) {
          setPan({ x: 0, y: 0 });
        }
        return next;
      });
    }
    lastTapRef.current = now;
  }

  return createPortal(
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-3000 flex flex-col bg-white"
      role="dialog"
    >
      <h2 className="sr-only" id={titleId}>
        {title}
      </h2>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        onPointerCancel={onPointerUp}
        onPointerDown={(event) => {
          onDoubleTap(event);
          onPointerDown(event);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {images.map((entry, itemIndex) => {
          const active = itemIndex === index;
          if (entry.type === "video" && !active) {
            return null;
          }

          return (
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              key={entry.id}
              style={
                active
                  ? {
                      transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
                    }
                  : undefined
              }
            >
              {entry.type === "video" ? (
                renderVideo(entry)
              ) : (
                <Image
                  alt={entry.alt}
                  className={cn(
                    "object-contain",
                    entry.objectPosition ?? "object-center",
                  )}
                  fill
                  priority={active}
                  sizes="100vw"
                  src={staticImageUrl(entry.src)}
                  unoptimized
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="relative flex min-h-22 items-center justify-between border-grey border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(43,45,65,0.1)]">
        <div className="flex items-center gap-2.5">
          <button
            aria-label={previousLabel}
            className={cn(galleryChromeButtonClassName, "size-12")}
            onClick={() => goBy(-1)}
            type="button"
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} />
          </button>
          <button
            aria-label={nextLabel}
            className={cn(galleryChromeButtonClassName, "size-12")}
            onClick={() => goBy(1)}
            type="button"
          >
            <ChevronRight className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 flex items-center justify-center gap-2.5"
        >
          {images.map((entry, itemIndex) => (
            <span
              className={cn(
                "rounded-full",
                itemIndex === index
                  ? "size-3 bg-brand"
                  : "size-2.5 bg-brand-dark/30",
              )}
              key={entry.id}
            />
          ))}
        </div>

        <button
          aria-label={closeLabel}
          className={cn(galleryChromeButtonClassName, "size-12")}
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
