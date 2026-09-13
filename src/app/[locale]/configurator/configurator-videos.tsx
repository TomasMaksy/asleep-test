"use client";

import { useEffect, useId, useRef, useState } from "react";
import { asleepNavyPackagingFilterStyle } from "@/components/asleep-navy-filter";
import { useAsleepNavyFilterStyle } from "@/components/asleep-navy-filter-style";
import {
  type BedKind,
  DEFAULT_FIRMNESS,
  type Firmness,
  holdVideoSrc,
  introVideoSrc,
  packagingVideoSrc,
  transitionVideoSrc,
  VIDEO_PLAYBACK_RATE,
} from "@/lib/configurator";
import { cn } from "@/lib/utils";

export type ClipKind = "intro" | "transition" | "packaging";

export type ConfiguratorClip =
  | { id: number; kind: "intro"; bed: BedKind; reverse?: boolean }
  | {
      id: number;
      kind: "transition";
      bed: BedKind;
      from: Firmness;
      to: Firmness;
    }
  | { id: number; kind: "packaging"; bed: BedKind }
  | { id: number; kind: "hold"; bed: BedKind; firmness: Firmness };

type ConfiguratorVideosProps = {
  bed: BedKind;
  clip: ConfiguratorClip | null;
  label: string;
  playbackRate?: number;
  reducedMotion: boolean;
  onEnded: (clip: ConfiguratorClip) => void;
  onReady?: (clip: ConfiguratorClip) => void;
};

const MATTRESS_SHADOW = {
  single: {
    contact: "30.8,71.8 55.2,74.4 75.5,60.2 51.1,57.6",
    soft: "29.7,72.4 55.6,75.3 77.2,60.2 51.3,57.3",
  },
  double: {
    contact: "17.2,77.2 64.5,82.6 85.5,64.2 38.2,58.8",
    soft: "15.4,77.9 65.6,83.6 87.9,64.1 37.7,58.4",
  },
} as const;

function clipSrc(clip: ConfiguratorClip): string {
  if (clip.kind === "intro") {
    return introVideoSrc(clip.bed, clip.reverse);
  }
  if (clip.kind === "packaging") {
    return packagingVideoSrc(clip.bed);
  }
  if (clip.kind === "hold") {
    return holdVideoSrc(clip.bed, clip.firmness);
  }
  return transitionVideoSrc(clip.bed, clip.from, clip.to);
}

function frameKind(clip: ConfiguratorClip): ClipKind {
  if (clip.kind === "packaging") {
    return "packaging";
  }
  if (clip.kind === "hold") {
    return clip.firmness === DEFAULT_FIRMNESS ? "intro" : "transition";
  }
  return clip.kind;
}

function usesScnFraming(bed: BedKind, kind: ClipKind) {
  return bed === "double" && kind === "transition";
}

function videoFitClass(bed: BedKind, kind: ClipKind) {
  if (kind === "packaging") {
    return "configurator-stage-video-packaging";
  }
  if (usesScnFraming(bed, kind)) {
    return "configurator-stage-video-scn";
  }
  return undefined;
}

function videoNavyStyle(
  kind: ClipKind,
  navyFilterStyle: { filter: string } | undefined,
) {
  if (!navyFilterStyle) {
    return undefined;
  }
  return kind === "packaging"
    ? asleepNavyPackagingFilterStyle
    : navyFilterStyle;
}

function videoHasPath(video: HTMLVideoElement, path: string) {
  const src = video.currentSrc || video.getAttribute("src") || video.src;
  const stem = path.replace(/\.(webm|mov|mp4)$/i, "");
  return src.includes(stem);
}

function seekToStart(video: HTMLVideoElement, done: () => void) {
  let frameA = 0;
  let frameB = 0;
  const paint = () => {
    frameA = requestAnimationFrame(() => {
      frameB = requestAnimationFrame(done);
    });
  };
  if (
    video.currentTime <= 0.02 &&
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    paint();
    return () => {
      cancelAnimationFrame(frameA);
      cancelAnimationFrame(frameB);
    };
  }
  const onSeeked = () => {
    video.removeEventListener("seeked", onSeeked);
    paint();
  };
  video.addEventListener("seeked", onSeeked);
  video.currentTime = 0;
  return () => {
    video.removeEventListener("seeked", onSeeked);
    cancelAnimationFrame(frameA);
    cancelAnimationFrame(frameB);
  };
}

export function ConfiguratorVideos({
  bed,
  clip,
  label,
  playbackRate = VIDEO_PLAYBACK_RATE,
  reducedMotion,
  onEnded,
  onReady,
}: ConfiguratorVideosProps) {
  const filterId = useId().replace(/:/g, "");
  const navyFilterStyle = useAsleepNavyFilterStyle();
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef<0 | 1>(0);
  const [visible, setVisible] = useState<0 | 1 | null>(null);
  const [clipKind, setClipKind] = useState<[ClipKind, ClipKind]>([
    "intro",
    "intro",
  ]);
  const lastClipIdRef = useRef<number | null>(null);
  const onEndedRef = useRef(onEnded);
  const onReadyRef = useRef(onReady);
  const playbackRateRef = useRef(playbackRate);

  onEndedRef.current = onEnded;
  onReadyRef.current = onReady;
  playbackRateRef.current = playbackRate;

  useEffect(() => {
    const rate = playbackRate;
    for (const video of [videoARef.current, videoBRef.current]) {
      if (video) {
        video.playbackRate = rate;
      }
    }
  }, [playbackRate]);

  useEffect(() => {
    if (clip) {
      return;
    }
    const video = videoARef.current;
    if (!video) {
      return;
    }
    video.src = introVideoSrc(bed);
    video.load();
    activeRef.current = 0;
    setClipKind((current) => ["intro", current[1]]);
    const showFirstFrame = () => {
      video.currentTime = 0;
      setVisible(0);
    };
    video.addEventListener("loadeddata", showFirstFrame);
    return () => video.removeEventListener("loadeddata", showFirstFrame);
  }, [bed, clip]);

  useEffect(() => {
    if (!clip || lastClipIdRef.current === clip.id) {
      return;
    }
    lastClipIdRef.current = clip.id;

    const current = activeRef.current;
    const incoming = current === 0 ? videoBRef.current : videoARef.current;
    const nextIndex: 0 | 1 = current === 0 ? 1 : 0;
    if (!incoming) {
      onEndedRef.current(clip);
      return;
    }

    const src = clipSrc(clip);
    incoming.playbackRate = playbackRateRef.current;
    if (!videoHasPath(incoming, src)) {
      incoming.src = src;
      incoming.load();
    }

    setClipKind((kinds) => {
      const next = [...kinds] as typeof kinds;
      next[nextIndex] = frameKind(clip);
      return next;
    });

    let cancelled = false;
    let started = false;
    let stopSeek = () => {};

    const reveal = () => {
      if (cancelled) {
        return;
      }
      activeRef.current = nextIndex;
      setVisible(nextIndex);
      onReadyRef.current?.(clip);
      const hidden = current === 0 ? videoARef.current : videoBRef.current;
      if (clip.kind === "intro" && hidden) {
        const preloadSrc = clip.reverse
          ? packagingVideoSrc(clip.bed)
          : introVideoSrc(clip.bed, true);
        if (!videoHasPath(hidden, preloadSrc)) {
          window.setTimeout(() => {
            if (cancelled) {
              return;
            }
            hidden.src = preloadSrc;
            hidden.preload = "metadata";
            hidden.load();
          }, 0);
        }
      }
    };

    const finish = () => {
      if (cancelled) {
        return;
      }
      cancelled = true;
      incoming.pause();
      onEndedRef.current(clip);
    };

    const start = () => {
      incoming.removeEventListener("canplay", start);
      if (cancelled || started) {
        return;
      }
      started = true;
      incoming.playbackRate = playbackRateRef.current;
      if (reducedMotion || clip.kind === "hold") {
        try {
          incoming.currentTime = Number.isFinite(incoming.duration)
            ? incoming.duration
            : 0;
        } catch {
          incoming.currentTime = 0;
        }
        reveal();
        finish();
        return;
      }
      stopSeek = seekToStart(incoming, () => {
        if (cancelled) {
          return;
        }
        reveal();
        const playResult = incoming.play();
        if (playResult) {
          playResult.catch(() => finish());
        }
      });
    };

    incoming.addEventListener("canplay", start);
    incoming.addEventListener("ended", finish);
    incoming.addEventListener("error", finish);
    if (incoming.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      start();
    }

    return () => {
      cancelled = true;
      stopSeek();
      incoming.removeEventListener("canplay", start);
      incoming.removeEventListener("ended", finish);
      incoming.removeEventListener("error", finish);
    };
  }, [clip, reducedMotion]);

  return (
    <div className="configurator-stage absolute inset-0 overflow-hidden">
      <div className="configurator-stage-fade">
        <div
          className={cn(
            "configurator-stage-zoom absolute inset-0 origin-center md:scale-100",
            bed === "double" ? "scale-110" : "scale-150",
          )}
        >
          <div
            className={cn(
              "configurator-stage-frame",
              bed === "double"
                ? "configurator-stage-frame-double"
                : "configurator-stage-frame-single",
            )}
          >
            {visible === null || clipKind[visible] !== "packaging" ? (
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible mix-blend-multiply"
                focusable="false"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <title>Mattress shadow</title>
                <defs>
                  <filter
                    height="180%"
                    id={`${filterId}-soft`}
                    primitiveUnits="userSpaceOnUse"
                    width="180%"
                    x="-40%"
                    y="-40%"
                  >
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.05" />
                  </filter>
                  <filter
                    height="160%"
                    id={`${filterId}-contact`}
                    primitiveUnits="userSpaceOnUse"
                    width="160%"
                    x="-30%"
                    y="-30%"
                  >
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.45" />
                  </filter>
                </defs>
                <polygon
                  fill="rgba(6,16,40,0.12)"
                  filter={`url(#${filterId}-soft)`}
                  points={MATTRESS_SHADOW[bed].soft}
                />
                <polygon
                  fill="rgba(6,16,40,0.20)"
                  filter={`url(#${filterId}-contact)`}
                  points={MATTRESS_SHADOW[bed].contact}
                />
              </svg>
            ) : null}
            <video
              aria-hidden={visible !== 0}
              className={cn(
                "configurator-stage-video",
                videoFitClass(bed, clipKind[0]),
                visible === 0 ? "opacity-100" : "opacity-0",
              )}
              muted
              playsInline
              preload="metadata"
              ref={videoARef}
              style={videoNavyStyle(clipKind[0], navyFilterStyle)}
            />
            <video
              aria-hidden={visible !== 1}
              className={cn(
                "configurator-stage-video",
                videoFitClass(bed, clipKind[1]),
                visible === 1 ? "opacity-100" : "opacity-0",
              )}
              muted
              playsInline
              preload="metadata"
              ref={videoBRef}
              style={videoNavyStyle(clipKind[1], navyFilterStyle)}
            />
          </div>
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
