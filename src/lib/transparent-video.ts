/** Safari plays HEVC-with-alpha. It plays WebM, but drops the VP9 alpha channel. */
export function needsHevcAlphaVideo() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return true;
  }
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }
  return (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|Firefox|FxiOS|Android/i.test(ua)
  );
}

export function transparentVideoSrc(webmPath: string) {
  return needsHevcAlphaVideo()
    ? webmPath.replace(/\.webm$/i, ".mp4")
    : webmPath;
}

/** iOS will not paint seeked frames until muted playback has started once. */
export async function primeVideoElement(video: HTMLVideoElement) {
  if (!needsHevcAlphaVideo()) {
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  try {
    await video.play();
    video.pause();
  } catch {
    const unlock = () => {
      void video
        .play()
        .then(() => {
          video.pause();
        })
        .catch(() => {});
    };
    window.addEventListener("touchstart", unlock, {
      once: true,
      passive: true,
    });
  }
}
