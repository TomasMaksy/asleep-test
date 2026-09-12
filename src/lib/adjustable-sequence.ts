import { STATIC_IMAGE_CACHE_VERSION } from "@/lib/static-image-url";

export const ADJUSTABLE_FRAME_COUNT = 277;
export const ADJUSTABLE_FRAME_WIDTH = 1126;
export const ADJUSTABLE_FRAME_HEIGHT = 880;

const FRAME_DIR = "/images/original-scroll/adjustable";
const LOOKAHEAD = 25;

let frames: Array<HTMLImageElement | undefined> | undefined;

export function adjustableFrameUrl(index: number) {
  const frame = clampFrame(index);
  return `${FRAME_DIR}/${String(frame).padStart(3, "0")}.jpg?v=${STATIC_IMAGE_CACHE_VERSION}`;
}

export function adjustableFrameIndex(progress: number) {
  return Math.round(clamp01(progress) * (ADJUSTABLE_FRAME_COUNT - 1));
}

export function prefetchAdjustableFrames(from: number, count = LOOKAHEAD) {
  const start = clampFrame(from);
  const end = Math.min(ADJUSTABLE_FRAME_COUNT - 1, start + count);
  for (let index = start; index <= end; index += 1) {
    getFrame(index);
  }
}

export function whenAdjustableFrameReady(index: number, onReady: () => void) {
  prefetchAdjustableFrames(index);
  const img = getFrame(index);
  if (img.complete && img.naturalWidth > 0) {
    onReady();
    return;
  }
  img.addEventListener("load", onReady, { once: true });
}

export function paintAdjustableFrame(
  ctx: CanvasRenderingContext2D,
  index: number,
  isCurrent: () => boolean,
) {
  const frame = clampFrame(index);
  prefetchAdjustableFrames(frame);
  const img = getFrame(frame);

  if (blit(ctx, img)) {
    return;
  }

  for (let previous = frame - 1; previous >= 0; previous -= 1) {
    const candidate = frameList()[previous];
    if (candidate && blit(ctx, candidate)) {
      break;
    }
  }

  img.onload = () => {
    if (isCurrent()) {
      blit(ctx, img);
    }
  };
}

function getFrame(index: number) {
  const list = frameList();
  const frame = clampFrame(index);
  const cached = list[frame];
  if (cached) {
    return cached;
  }

  const img = new Image();
  img.decoding = "async";
  if (frame === 0) {
    img.fetchPriority = "high";
  }
  img.src = adjustableFrameUrl(frame);
  list[frame] = img;
  return img;
}

function frameList() {
  if (!frames) {
    frames = Array.from({ length: ADJUSTABLE_FRAME_COUNT });
  }
  return frames;
}

function blit(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  if (!img.complete || img.naturalWidth === 0) {
    return false;
  }
  ctx.drawImage(img, 0, 0, ADJUSTABLE_FRAME_WIDTH, ADJUSTABLE_FRAME_HEIGHT);
  return true;
}

function clampFrame(index: number) {
  return Math.min(ADJUSTABLE_FRAME_COUNT - 1, Math.max(0, index));
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
