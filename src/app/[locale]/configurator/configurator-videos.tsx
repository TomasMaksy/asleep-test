"use client";

import { useEffect, useId, useRef, useState } from "react";
import { asleepNavyPackagingFilterStyle } from "@/components/asleep-navy-filter";
import { useAsleepNavyFilterStyle } from "@/components/asleep-navy-filter-style";
import {
  type BedKind,
  introPosterSrc,
  introVideoSrc,
  packagingVideoSrc,
  preloadConfiguratorPosters,
  transitionVideoSrc,
  VIDEO_PLAYBACK_RATE,
  VIDEO_PLAYBACK_RATE_CATCHUP,
} from "@/lib/configurator";
import { staticImageUrl } from "@/lib/static-image-url";
import { cn } from "@/lib/utils";

export type ClipKind = "intro" | "transition" | "packaging";

export type ConfiguratorClip =
  | { id: number; kind: "intro"; bed: BedKind; reverse?: boolean }
  | {
      id: number;
      kind: "transition";
      bed: BedKind;
      /** Asset folder — Double (alone or together) uses Double SCN files. */
      clipBed: BedKind;
      from: number;
      to: number;
    }
  | { id: number; kind: "packaging"; bed: BedKind }
  | {
      id: number;
      kind: "hold";
      bed: BedKind;
      clipBed: BedKind;
      state: number;
      defaultState: number;
    };

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
    if (clip.state === clip.defaultState) {
      return introVideoSrc(clip.bed);
    }
    return transitionVideoSrc(clip.clipBed, clip.defaultState, clip.state);
  }
  return transitionVideoSrc(clip.clipBed, clip.from, clip.to);
}

function frameKind(clip: ConfiguratorClip): ClipKind {
  if (clip.kind === "packaging") {
    return "packaging";
  }
  if (clip.kind === "hold") {
    return clip.state === clip.defaultState ? "intro" : "transition";
  }
  return clip.kind;
}

function usesScnFraming(bed: BedKind, kind: ClipKind) {
  return bed === "double" && kind === "transition";
}

/** Closed sits low; open lifts the stack (not the shadow) and stays there. */
function mediaLift(
  clip: ConfiguratorClip | null,
): "closed" | "open" | "packaging" {
  if (!clip) {
    return "closed";
  }
  if (clip.kind === "packaging") {
    return "packaging";
  }
  if (clip.kind === "intro" && clip.reverse) {
    return "closed";
  }
  return "open";
}

/**
 * Lift timings in opening-clip content seconds (file timeline).
 * Tuned so at 1.5× wall = delay 0.42s / dur 1.05s open, delay 0.7s close.
 * Divided by playbackRate so speed-ups stay locked to the video.
 */
const LIFT_CONTENT = {
  open: { delay: 0.63, duration: 1.575 },
  closed: { delay: 1.05, duration: 1.575 },
  packaging: { delay: 0, duration: 0.35 },
} as const;

const LIFT_EASING = {
  // Sharp S-curve: holds, then moves, then settles (no bounce).
  open: "cubic-bezier(0.85, 0, 0.15, 1)",
  closed: "cubic-bezier(0.85, 0, 0.15, 1)",
  packaging: "cubic-bezier(0.32, 0.72, 0, 1)",
} as const;

function mediaLiftStyle(
  lift: "closed" | "open" | "packaging",
  playbackRate: number,
  reducedMotion: boolean,
): { transition: string } {
  // Catchup seeks the clip to the end — snap the stack with it.
  if (
    reducedMotion ||
    playbackRate >= VIDEO_PLAYBACK_RATE_CATCHUP ||
    playbackRate >= 4
  ) {
    return { transition: "none" };
  }

  const rate = Math.max(playbackRate, 0.01);
  const { delay, duration } = LIFT_CONTENT[lift];
  // Packaging is a short settle, not tied to the opening plate timeline.
  const wallDelay = lift === "packaging" ? delay : delay / rate;
  const wallDuration = lift === "packaging" ? duration : duration / rate;

  return {
    transition: `transform ${wallDuration}s ${LIFT_EASING[lift]} ${wallDelay}s`,
  };
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

function applyPlaybackRate(video: HTMLVideoElement, rate: number) {
  try {
    video.playbackRate = rate;
  } catch {
    try {
      video.playbackRate = 2;
    } catch {
      return;
    }
  }

  if (rate < VIDEO_PLAYBACK_RATE_CATCHUP || video.playbackRate >= 4) {
    return;
  }

  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    return;
  }

  try {
    video.currentTime = duration;
  } catch {
    // Some engines reject seeks while the source is still loading.
  }
}

function videoHasPath(video: HTMLVideoElement, path: string) {
  const src = video.currentSrc || video.getAttribute("src") || video.src;
  const stem = path.replace(/\.(webm|mov|mp4)$/i, "");
  return src.includes(stem);
}

function seekToStart(video: HTMLVideoElement, done: () => void) {
  if (
    video.currentTime <= 0.02 &&
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    done();
    return () => {};
  }
  const onSeeked = () => {
    video.removeEventListener("seeked", onSeeked);
    done();
  };
  video.addEventListener("seeked", onSeeked);
  try {
    video.currentTime = 0;
  } catch {
    video.removeEventListener("seeked", onSeeked);
    done();
  }
  return () => {
    video.removeEventListener("seeked", onSeeked);
  };
}

/**
 * Opacity 0 layers are often skipped by the compositor, so rVFC alone is not
 * enough. Keep the outgoing clip as `front` and prime the incoming as `back`
 * (opacity 1, lower z-index) so frames actually paint; then promote.
 */
type VideoLayer = "front" | "back" | "idle" | "fade-out";

function setVideoLayer(video: HTMLVideoElement, layer: VideoLayer) {
  video.dataset.layer = layer;
  video.setAttribute("aria-hidden", layer === "front" ? "false" : "true");
}

/** Resolve after `count` frames have been sent to the compositor. */
function whenVideoFramesPainted(
  video: HTMLVideoElement,
  count: number,
  done: () => void,
): () => void {
  let cancelled = false;
  let painted = 0;
  let rafA = 0;
  let rafB = 0;
  let rvfcHandle = 0;

  const finish = () => {
    if (cancelled) {
      return;
    }
    cancelled = true;
    done();
  };

  const onFrame = () => {
    if (cancelled) {
      return;
    }
    painted += 1;
    if (painted >= count) {
      finish();
      return;
    }
    if (typeof video.requestVideoFrameCallback === "function") {
      rvfcHandle = video.requestVideoFrameCallback(onFrame);
    }
  };

  if (typeof video.requestVideoFrameCallback === "function") {
    rvfcHandle = video.requestVideoFrameCallback(onFrame);
  } else {
    rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(finish);
    });
  }

  const timeout = window.setTimeout(finish, 2000);

  return () => {
    cancelled = true;
    window.clearTimeout(timeout);
    cancelAnimationFrame(rafA);
    cancelAnimationFrame(rafB);
    if (rvfcHandle && typeof video.cancelVideoFrameCallback === "function") {
      video.cancelVideoFrameCallback(rvfcHandle);
    }
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
  /** Bed framing follows images instantly on the size step; videos update on reveal. */
  const [displayBed, setDisplayBed] = useState<BedKind>(bed);
  const [showPoster, setShowPoster] = useState(true);
  const [clipKind, setClipKind] = useState<[ClipKind, ClipKind]>([
    "intro",
    "intro",
  ]);
  const clipKindRef = useRef(clipKind);
  clipKindRef.current = clipKind;
  const lastClipIdRef = useRef<number | null>(null);
  const onEndedRef = useRef(onEnded);
  const onReadyRef = useRef(onReady);
  const playbackRateRef = useRef(playbackRate);
  /** Once a video frame has painted, dual-buffer covers swaps — never flash the closed poster under alpha. */
  const stageHasVideoRef = useRef(false);
  const idle = clip === null;

  onEndedRef.current = onEnded;
  onReadyRef.current = onReady;
  playbackRateRef.current = playbackRate;

  useEffect(() => {
    preloadConfiguratorPosters();
  }, []);

  useEffect(() => {
    const rate = playbackRate;
    for (const video of [videoARef.current, videoBRef.current]) {
      if (video) {
        applyPlaybackRate(video, rate);
      }
    }
  }, [playbackRate]);

  /**
   * Size step: static posters only. Unload any video so rapid single↔double
   * toggles never queue HEVC/VP9 decodes.
   */
  useEffect(() => {
    if (!idle) {
      return;
    }

    setDisplayBed(bed);
    setShowPoster(true);
    setVisible(null);
    lastClipIdRef.current = null;
    stageHasVideoRef.current = false;

    for (const video of [videoARef.current, videoBRef.current]) {
      if (!video) {
        continue;
      }
      video.pause();
      if (video.getAttribute("src") || video.currentSrc) {
        video.removeAttribute("src");
        video.load();
      }
      setVideoLayer(video, "idle");
    }
  }, [bed, idle]);

  useEffect(() => {
    if (!clip || lastClipIdRef.current === clip.id) {
      return;
    }
    lastClipIdRef.current = clip.id;

    const current = activeRef.current;
    const outgoing = current === 0 ? videoARef.current : videoBRef.current;
    const incoming = current === 0 ? videoBRef.current : videoARef.current;
    const nextIndex: 0 | 1 = current === 0 ? 1 : 0;
    if (!incoming) {
      onEndedRef.current(clip);
      return;
    }

    // Packaging is a different subject — never keep it as the dual-buffer
    // cover under the mattress (both show through alpha). Fade it out instead.
    const outgoingIsPackaging = clipKindRef.current[current] === "packaging";

    const src = clipSrc(clip);
    applyPlaybackRate(incoming, playbackRateRef.current);
    if (!videoHasPath(incoming, src)) {
      incoming.src = src;
      incoming.load();
    }

    setClipKind((kinds) => {
      const next = [...kinds] as typeof kinds;
      next[nextIndex] = frameKind(clip);
      return next;
    });

    let disposed = false;
    let started = false;
    let revealed = false;
    let ended = false;
    let stopSeek = () => {};
    let stopPaint = () => {};
    let hideOutgoingRaf = 0;
    let fadeOutTimer = 0;

    if (outgoing && outgoingIsPackaging) {
      outgoing.pause();
      // Start from the visible packaging layer so opacity can transition.
      setVideoLayer(outgoing, "front");
      void outgoing.offsetWidth;
      setVideoLayer(outgoing, "fade-out");
      fadeOutTimer = window.setTimeout(() => {
        if (!disposed && outgoing.dataset.layer === "fade-out") {
          setVideoLayer(outgoing, "idle");
        }
      }, 300);
    }

    const reveal = () => {
      if (disposed || revealed) {
        return;
      }
      revealed = true;
      // Promote incoming on top while outgoing still covers any transparent gaps.
      setVideoLayer(incoming, "front");
      if (outgoing && !outgoingIsPackaging) {
        setVideoLayer(outgoing, "back");
      }
      activeRef.current = nextIndex;
      setDisplayBed(clip.bed);
      setVisible(nextIndex);
      stageHasVideoRef.current = true;
      setShowPoster(false);
      onReadyRef.current?.(clip);

      hideOutgoingRaf = requestAnimationFrame(() => {
        hideOutgoingRaf = requestAnimationFrame(() => {
          if (disposed) {
            return;
          }
          if (outgoing && !outgoingIsPackaging) {
            setVideoLayer(outgoing, "idle");
          }
          if (clip.kind === "intro" && outgoing) {
            const preloadSrc = clip.reverse
              ? packagingVideoSrc(clip.bed)
              : introVideoSrc(clip.bed, true);
            if (!videoHasPath(outgoing, preloadSrc)) {
              outgoing.src = preloadSrc;
              outgoing.preload = "auto";
              outgoing.load();
            }
          }
        });
      });
    };

    const finish = () => {
      if (disposed || ended) {
        return;
      }
      ended = true;
      incoming.pause();
      onEndedRef.current(clip);
    };

    /** Play as `back` under the current front so frames actually composite. */
    const playThenReveal = () => {
      if (disposed) {
        return;
      }
      if (outgoing && !outgoingIsPackaging) {
        setVideoLayer(outgoing, "front");
      }
      setVideoLayer(incoming, "back");
      applyPlaybackRate(incoming, playbackRateRef.current);
      const playResult = incoming.play();
      // Two frames: first decode can still be empty on HEVC/alpha.
      stopPaint = whenVideoFramesPainted(incoming, 2, reveal);
      if (playResult) {
        playResult.catch(() => {
          reveal();
          finish();
        });
      }
    };

    const start = () => {
      incoming.removeEventListener("canplay", start);
      if (disposed || started) {
        return;
      }
      started = true;
      applyPlaybackRate(incoming, playbackRateRef.current);
      if (reducedMotion || clip.kind === "hold") {
        try {
          incoming.currentTime = Number.isFinite(incoming.duration)
            ? incoming.duration
            : 0;
        } catch {
          incoming.currentTime = 0;
        }
        const settleHold = () => {
          if (disposed) {
            return;
          }
          if (outgoing && !outgoingIsPackaging) {
            setVideoLayer(outgoing, "front");
          }
          setVideoLayer(incoming, "back");
          stopPaint = whenVideoFramesPainted(incoming, 2, () => {
            reveal();
            finish();
          });
          void incoming
            .play()
            .then(() => {
              incoming.pause();
            })
            .catch(() => {
              reveal();
              finish();
            });
        };
        if (incoming.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          settleHold();
        } else {
          const onSeeked = () => {
            incoming.removeEventListener("seeked", onSeeked);
            settleHold();
          };
          incoming.addEventListener("seeked", onSeeked);
        }
        return;
      }
      stopSeek = seekToStart(incoming, playThenReveal);
    };

    // Closed still only covers size → first paint. Re-showing it under an
    // already-open alpha video flashes the collapsed mattress through gaps.
    if (!stageHasVideoRef.current) {
      setShowPoster(true);
    }
    setDisplayBed(clip.bed);

    incoming.addEventListener("canplay", start);
    incoming.addEventListener("ended", finish);
    incoming.addEventListener("error", finish);
    if (incoming.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      start();
    }

    return () => {
      disposed = true;
      stopSeek();
      stopPaint();
      cancelAnimationFrame(hideOutgoingRaf);
      window.clearTimeout(fadeOutTimer);
      incoming.removeEventListener("canplay", start);
      incoming.removeEventListener("ended", finish);
      incoming.removeEventListener("error", finish);
    };
  }, [clip, reducedMotion]);

  const lift = mediaLift(clip);

  return (
    <div className="configurator-stage absolute inset-0 overflow-hidden">
      <div className="configurator-stage-fade">
        <div
          className={cn(
            // Mobile zooms both; desktop keeps single at 1 and shrinks
            // double by the same 1.1/1.5 ratio so it stays relative to single.
            "configurator-stage-zoom absolute inset-0 origin-center",
            displayBed === "double"
              ? "scale-110 md:scale-[0.73]"
              : "scale-150 md:scale-100",
          )}
        >
          <div
            className={cn(
              "configurator-stage-frame",
              displayBed === "double"
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
                  points={MATTRESS_SHADOW[displayBed].soft}
                />
                <polygon
                  fill="rgba(6,16,40,0.20)"
                  filter={`url(#${filterId}-contact)`}
                  points={MATTRESS_SHADOW[displayBed].contact}
                />
              </svg>
            ) : null}
            <div
              className="configurator-stage-media"
              data-lift={lift}
              style={mediaLiftStyle(lift, playbackRate, reducedMotion)}
            >
              {/* Both stills stay mounted — size toggles are CSS opacity only.
                  Same navy SVG filter as the stage videos so still ↔ frame 0 match. */}
              {(["single", "double"] as const).map((kind) => (
                // biome-ignore lint/performance/noImgElement: alpha stills; next/image flattens transparency
                <img
                  alt=""
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 z-9 size-full object-contain transition-opacity duration-150",
                    showPoster && displayBed === kind
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                  decoding="async"
                  draggable={false}
                  height={kind === "double" ? 1280 : 1520}
                  key={kind}
                  src={staticImageUrl(introPosterSrc(kind))}
                  style={navyFilterStyle}
                  width={1280}
                />
              ))}
              <video
                className={cn(
                  "configurator-stage-video",
                  videoFitClass(displayBed, clipKind[0]),
                )}
                muted
                playsInline
                preload="none"
                ref={videoARef}
                style={videoNavyStyle(clipKind[0], navyFilterStyle)}
              />
              <video
                className={cn(
                  "configurator-stage-video",
                  videoFitClass(displayBed, clipKind[1]),
                )}
                muted
                playsInline
                preload="none"
                ref={videoBRef}
                style={videoNavyStyle(clipKind[1], navyFilterStyle)}
              />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
