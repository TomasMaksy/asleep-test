"use client";

import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function DifferenceVideo({
  pauseLabel,
  playLabel,
  src,
}: {
  pauseLabel: string;
  playLabel: string;
  src: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const sync = () => {
      setPlaying(!video.paused);
    };

    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          video.pause();
          return;
        }
        if (reduceMotion) {
          return;
        }
        void video.play().catch(() => {});
      },
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener("play", sync);
      video.removeEventListener("pause", sync);
    };
  }, [reduceMotion]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }

  return (
    <div className="relative">
      <video
        className="h-auto w-full"
        loop
        muted
        playsInline
        preload="metadata"
        ref={videoRef}
        src={src}
      />
      <button
        aria-label={playing ? pauseLabel : playLabel}
        className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand/80"
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
