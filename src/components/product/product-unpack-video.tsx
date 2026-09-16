"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { staticImageUrl } from "@/lib/static-image-url";
import { primeVideoElement, transparentVideoSrc } from "@/lib/transparent-video";
import { cn } from "@/lib/utils";

const FORWARD_WEBM = "/images/product-unpack.webm";
const REVERSE_WEBM = "/images/product-unpack-reverse.webm";
const POSTER = "/images/product-unpack.webp";
const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 488;
const EDGE = 0.05;
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

type Direction = "forward" | "reverse";

function otherDirection(direction: Direction): Direction {
  return direction === "forward" ? "reverse" : "forward";
}

function clampTime(video: HTMLVideoElement, time: number) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    return Math.max(0, time);
  }
  return Math.min(duration, Math.max(0, time));
}

function mirroredTime(video: HTMLVideoElement) {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  return clampTime(video, duration - video.currentTime);
}

function canAdvance(video: HTMLVideoElement) {
  return (
    Number.isFinite(video.duration) && video.currentTime < video.duration - EDGE
  );
}

export function ProductUnpackVideo({ alt }: { alt: string }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const forwardRef = useRef<HTMLVideoElement>(null);
  const reverseRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef<Direction>("forward");
  const generationRef = useRef(0);
  const [src, setSrc] = useState<{
    forward: string;
    reverse: string;
  } | null>(null);
  const [active, setActive] = useState<Direction>("forward");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const root = rootRef.current;
    const card = root?.closest("article") ?? root;
    if (!card) {
      return;
    }

    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        setSrc({
          forward: transparentVideoSrc(FORWARD_WEBM),
          reverse: transparentVideoSrc(REVERSE_WEBM),
        });
        reveal.disconnect();
      },
      { rootMargin: "600px" },
    );
    reveal.observe(card);

    return () => reveal.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const forward = forwardRef.current;
    const reverse = reverseRef.current;
    if (!src || !forward || !reverse) {
      return;
    }

    let cancelled = false;
    let readyCount = 0;

    const markReady = () => {
      readyCount += 1;
      if (!cancelled && readyCount >= 2) {
        setReady(true);
      }
    };

    const prepare = (video: HTMLVideoElement) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      const onReady = () => {
        video.removeEventListener("loadeddata", onReady);
        markReady();
      };
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        markReady();
        return;
      }
      video.addEventListener("loadeddata", onReady);
    };

    prepare(forward);
    prepare(reverse);
    void primeVideoElement(forward).then(() => {
      if (!cancelled) {
        forward.pause();
        forward.currentTime = 0;
      }
    });
    void primeVideoElement(reverse).then(() => {
      if (!cancelled) {
        reverse.pause();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (reduceMotion || !src) {
      return;
    }

    const root = rootRef.current;
    const card = root?.closest("article") ?? root;
    const forward = forwardRef.current;
    const reverse = reverseRef.current;
    if (!card || !forward || !reverse) {
      return;
    }

    const videos = { forward, reverse } as const;
    let intent: Direction | "packed" = "packed";

    const show = (direction: Direction) => {
      activeRef.current = direction;
      setActive(direction);
    };

    const playDirection = (direction: Direction) => {
      intent = direction;
      const incoming = videos[direction];
      const outgoing = videos[otherDirection(direction)];

      if (incoming.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        const onReady = () => {
          incoming.removeEventListener("loadeddata", onReady);
          if (intent === direction) {
            playDirection(direction);
          }
        };
        incoming.addEventListener("loadeddata", onReady);
        return;
      }

      const generation = ++generationRef.current;
      const nextTime =
        activeRef.current === direction
          ? incoming.currentTime
          : mirroredTime(outgoing);

      outgoing.pause();
      incoming.pause();

      const start = () => {
        if (generation !== generationRef.current) {
          return;
        }
        show(direction);
        if (!canAdvance(incoming)) {
          return;
        }
        void incoming.play().catch(() => {});
      };

      if (
        Math.abs(incoming.currentTime - nextTime) <= EDGE &&
        incoming.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        start();
        return;
      }

      const onSeeked = () => {
        incoming.removeEventListener("seeked", onSeeked);
        start();
      };
      incoming.addEventListener("seeked", onSeeked);
      try {
        incoming.currentTime = clampTime(incoming, nextTime);
      } catch {
        start();
      }
    };

    const resetPacked = () => {
      intent = "packed";
      generationRef.current += 1;
      reverse.pause();
      forward.pause();
      try {
        forward.currentTime = 0;
      } catch {
        // Seeking can throw while the source is still loading.
      }
      show("forward");
    };

    const hoverable = window.matchMedia(HOVER_QUERY);
    let inView = false;

    const onEnter = () => playDirection("forward");
    const onLeave = () => playDirection("reverse");
    const onFocusIn = () => playDirection("forward");
    const onFocusOut = (event: FocusEvent) => {
      if (!card.contains(event.relatedTarget as Node | null)) {
        playDirection("reverse");
      }
    };

    const view = new IntersectionObserver(
      ([entry]) => {
        if (!entry || hoverable.matches) {
          return;
        }
        const next = entry.intersectionRatio >= 0.45;
        if (next === inView) {
          return;
        }
        inView = next;
        if (next) {
          playDirection("forward");
        } else if (entry.intersectionRatio > 0) {
          playDirection("reverse");
        } else {
          resetPacked();
        }
      },
      { threshold: [0, 0.25, 0.45, 0.7] },
    );

    const bindHover = () => {
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointerleave", onLeave);
      card.addEventListener("focusin", onFocusIn);
      card.addEventListener("focusout", onFocusOut);
    };

    const unbindHover = () => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", onFocusOut);
    };

    const onHoverChange = () => {
      unbindHover();
      if (hoverable.matches) {
        bindHover();
      }
    };

    onHoverChange();
    hoverable.addEventListener("change", onHoverChange);
    view.observe(card);

    return () => {
      generationRef.current += 1;
      unbindHover();
      hoverable.removeEventListener("change", onHoverChange);
      view.disconnect();
    };
  }, [reduceMotion, src]);

  return (
    <div className="relative aspect-720/488 w-full" ref={rootRef}>
      {/* biome-ignore lint/performance/noImgElement: next/image flattens WebP alpha onto black */}
      <img
        alt={alt}
        className={cn(
          "absolute inset-0 size-full object-contain object-left",
          ready && !reduceMotion && "pointer-events-none opacity-0",
        )}
        decoding="async"
        height={VIDEO_HEIGHT}
        src={staticImageUrl(POSTER)}
        width={VIDEO_WIDTH}
      />
      {src ? (
        <>
          <video
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 size-full bg-transparent object-contain object-left",
              active === "forward" && ready ? "opacity-100" : "opacity-0",
            )}
            disablePictureInPicture
            height={VIDEO_HEIGHT}
            muted
            playsInline
            preload="auto"
            ref={forwardRef}
            src={staticImageUrl(src.forward)}
            width={VIDEO_WIDTH}
          />
          <video
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 size-full bg-transparent object-contain object-left",
              active === "reverse" && ready ? "opacity-100" : "opacity-0",
            )}
            disablePictureInPicture
            height={VIDEO_HEIGHT}
            muted
            playsInline
            preload="auto"
            ref={reverseRef}
            src={staticImageUrl(src.reverse)}
            width={VIDEO_WIDTH}
          />
        </>
      ) : null}
    </div>
  );
}
