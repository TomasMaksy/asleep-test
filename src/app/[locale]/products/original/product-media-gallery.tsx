"use client";

import { Pause, Play, ZoomIn } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { swiffyslider } from "swiffy-slider";
import { galleryChromeButtonClassName } from "@/components/product/product-gallery-chrome";
import type { Locale } from "@/i18n/routing";
import { useOriginalSizeStore } from "@/lib/product-original-size-store";
import {
  layersAnimationSrc,
  layersStripThumbSrc,
  layersThumbSrc,
  type MattressSizeId,
  packshotSrc,
  packshotThumbSrc,
} from "@/lib/product-original-sizes";
import { staticImageUrl } from "@/lib/static-image-url";
import { cn } from "@/lib/utils";

import "./product-media-gallery.css";
import "swiffy-slider/css";

const ProductGalleryLightbox = dynamic(
  () =>
    import("@/components/product/product-gallery-lightbox").then((mod) => ({
      default: mod.ProductGalleryLightbox,
    })),
  { ssr: false },
);

const GALLERY = {
  hero: "/images/product-gallery/hero-square.webp",
  heroThumb: "/images/product-gallery/thumbs/hero.webp",
  lifestyle: "/images/product-gallery/lifestyle.webp",
  lifestyleThumb: "/images/product-gallery/thumbs/lifestyle.webp",
  benefits: {
    lt: "/images/product-gallery/benefits.webp",
    en: "/images/product-gallery/benefits-en.webp",
  },
  benefitsThumb: {
    lt: "/images/product-gallery/thumbs/benefits.webp",
    en: "/images/product-gallery/thumbs/benefits-en.webp",
  },
} as const;

function benefitsSrc(locale: string) {
  return GALLERY.benefits[locale as Locale] ?? GALLERY.benefits.lt;
}

function benefitsThumbSrc(locale: string) {
  return GALLERY.benefitsThumb[locale as Locale] ?? GALLERY.benefitsThumb.lt;
}

type SlideId = "hero" | "packshot" | "lifestyle" | "layers" | "benefits";

type Slide = {
  id: SlideId;
  type: "image" | "video";
  src: string;
  thumb: string;
  poster?: string;
  altKey:
    | "heroAlt"
    | "packshotAlt"
    | "lifestyleAlt"
    | "benefitsAlt"
    | "layersAlt";
  objectPosition?: string;
};

const GALLERY_QUALITY = 90;

function gallerySlides(
  packshot: string,
  packshotThumb: string,
  layersVideo: string,
  layersPoster: string,
  layersThumb: string,
  benefits: string,
  benefitsThumb: string,
): Slide[] {
  return [
    {
      id: "hero",
      type: "image",
      src: GALLERY.hero,
      thumb: GALLERY.heroThumb,
      altKey: "heroAlt",
    },
    {
      id: "packshot",
      type: "image",
      src: packshot,
      thumb: packshotThumb,
      altKey: "packshotAlt",
    },
    {
      id: "lifestyle",
      type: "image",
      src: GALLERY.lifestyle,
      thumb: GALLERY.lifestyleThumb,
      altKey: "lifestyleAlt",
    },
    {
      id: "layers",
      type: "video",
      src: layersVideo,
      thumb: layersThumb,
      poster: layersPoster,
      altKey: "layersAlt",
      objectPosition: "object-[center_68%]",
    },
    {
      id: "benefits",
      type: "image",
      src: benefits,
      thumb: benefitsThumb,
      altKey: "benefitsAlt",
      objectPosition: "object-top",
    },
  ];
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function LayersVideo({
  contain,
  interactive = true,
  pauseLabel,
  playLabel,
  poster,
  src,
  className,
}: {
  contain?: boolean;
  interactive?: boolean;
  pauseLabel?: string;
  playLabel?: string;
  poster: string;
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Warm bytes after first paint so swipe-in play is instant. Do not call
    // video.load() on show — that resets the element and is what felt like lag.
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;
    const warm = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }
      video.preload = "auto";
    };
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(warm, { timeout: 2000 });
    } else {
      timeoutHandle = window.setTimeout(warm, 600);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video
            .play()
            .then(() => setPlaying(true))
            .catch(() => {});
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      // Start a bit early while the snap scroll is still moving.
      { threshold: 0.15, rootMargin: "0px 40% 0px 40%" },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      if (
        idleHandle !== null &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [src]);

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
    <div
      className={cn(
        "pointer-events-none relative overflow-hidden bg-surface",
        contain && "flex items-center justify-center",
        className,
      )}
    >
      <video
        className={
          contain
            ? "h-auto max-h-[min(100%,1080px)] w-auto max-w-[min(100%,908px)] object-contain"
            : "absolute inset-0 size-full object-cover object-[center_68%]"
        }
        loop
        muted
        playsInline
        poster={staticImageUrl(poster)}
        preload="metadata"
        ref={videoRef}
        src={staticImageUrl(src)}
      />

      {interactive && pauseLabel && playLabel ? (
        <button
          aria-label={playing ? pauseLabel : playLabel}
          className="pointer-events-auto absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
          onClick={(event) => {
            event.stopPropagation();
            togglePlayback();
          }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          {playing ? (
            <Pause className="size-3.5 fill-current" strokeWidth={0} />
          ) : (
            <Play className="ml-0.5 size-3.5 fill-current" strokeWidth={0} />
          )}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Strip thumbnail for the layers slide: paint the static thumb first, then
 * mount the same gallery video after the thumb is near-view + idle so it
 * doesn't compete with LCP. Browser cache usually serves the bytes already
 * fetched by the main-stage LayersVideo.
 */
function LayersThumbVideo({
  objectPosition = "object-center",
  poster,
  reduceMotion = false,
  src,
}: {
  objectPosition?: string;
  poster: string;
  reduceMotion?: boolean;
  src: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    let cancelled = false;
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const armLoad = () => {
      if (cancelled) {
        return;
      }
      setShouldLoad(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        observer.disconnect();
        if (typeof window.requestIdleCallback === "function") {
          idleHandle = window.requestIdleCallback(armLoad, { timeout: 2500 });
        } else {
          timeoutHandle = window.setTimeout(armLoad, 500);
        }
      },
      { rootMargin: "80px" },
    );

    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (
        idleHandle !== null &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const onReady = () => setReady(true);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      onReady();
    } else {
      video.addEventListener("loadeddata", onReady);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(video);

    return () => {
      video.removeEventListener("loadeddata", onReady);
      observer.disconnect();
    };
  }, [shouldLoad]);

  return (
    <span className="relative block size-full overflow-hidden" ref={rootRef}>
      <Image
        alt=""
        className={cn("object-cover", objectPosition)}
        fill
        sizes="72px"
        src={staticImageUrl(poster)}
        unoptimized
      />
      {shouldLoad ? (
        <video
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-300",
            objectPosition,
            ready ? "opacity-100" : "opacity-0",
          )}
          loop
          muted
          playsInline
          preload="none"
          ref={videoRef}
          src={staticImageUrl(src)}
          tabIndex={-1}
        />
      ) : null}
    </span>
  );
}

function GalleryTile({
  src,
  alt,
  zoomLabel,
  objectPosition = "object-center",
  onOpen,
}: {
  src: string;
  alt: string;
  zoomLabel: string;
  objectPosition?: string;
  onOpen: () => void;
}) {
  return (
    <div className="relative aspect-390/488 overflow-hidden bg-surface">
      <Image
        alt={alt}
        className={`object-cover ${objectPosition}`}
        fill
        key={src}
        quality={GALLERY_QUALITY}
        sizes="(min-width: 1024px) 28vw, 50vw"
        src={staticImageUrl(src)}
      />
      <button
        aria-haspopup="dialog"
        aria-label={zoomLabel}
        className="absolute inset-0 z-1 cursor-zoom-in"
        onClick={onOpen}
        type="button"
      />
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        galleryChromeButtonClassName,
        "absolute right-4 bottom-4 z-20 size-11 sm:right-5 sm:bottom-5",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      type="button"
    >
      <ZoomIn className="size-4" strokeWidth={1.75} />
    </button>
  );
}

const AUTOPLAY_MS = 5000;
const AUTOPLAY_START_DELAY_MS = 8000;
const PACKSHOT_SLIDE_INDEX = 1;

/** Fractional slide position from native scroll-snap (0 … slideCount-1). */
function slideProgress(container: HTMLElement, slideCount: number) {
  if (slideCount <= 1) {
    return 0;
  }

  const maxScroll = container.scrollWidth - container.offsetWidth;
  if (maxScroll <= 0) {
    return 0;
  }

  return (Math.abs(container.scrollLeft) / maxScroll) * (slideCount - 1);
}

function MobileGallery({
  awardAlt,
  awardSrc,
  packshot,
  sizeId,
}: {
  awardAlt: string;
  awardSrc: string;
  packshot: string;
  sizeId: MattressSizeId;
}) {
  const t = useTranslations("productOriginal.hero.gallery");
  const locale = useLocale();
  const reduceMotion = usePrefersReducedMotion();
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbsRootRef = useRef<HTMLDivElement>(null);
  const thumbsRailRef = useRef<HTMLDivElement>(null);
  const previousSizeId = useRef(sizeId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const slides = gallerySlides(
    packshot,
    packshotThumbSrc(sizeId),
    layersAnimationSrc(sizeId),
    layersThumbSrc(sizeId),
    layersStripThumbSrc(sizeId),
    benefitsSrc(locale),
    benefitsThumbSrc(locale),
  );

  function openZoom(index: number = activeIndex) {
    if (index >= 0 && index < slides.length) {
      setZoomIndex(index);
    }
  }

  useEffect(() => {
    const root = sliderRef.current;
    const thumbsRoot = thumbsRootRef.current;
    if (!root) {
      return;
    }

    // Official API: https://www.swiffyslider.com/docs/ + npm `swiffy-slider`
    swiffyslider.initSlider(root);

    const container = root.querySelector(".slider-container");
    if (!(container instanceof HTMLElement)) {
      return;
    }

    // Drive the underline from scroll itself (rAF). Waiting for onSlideEnd + a
    // CSS transition is what made the bar lag behind finger swipes.
    let raf = 0;
    const syncFromScroll = () => {
      raf = 0;
      const progress = slideProgress(container, container.children.length);
      thumbsRoot?.style.setProperty("--active-index", String(progress));
      const index = Math.round(progress);
      setActiveIndex((prev) => (prev === index ? prev : index));
    };
    const onScroll = () => {
      if (raf === 0) {
        raf = requestAnimationFrame(syncFromScroll);
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    syncFromScroll();

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf !== 0) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  useEffect(() => {
    const root = sliderRef.current;
    if (!root || reduceMotion || zoomIndex !== null) {
      return;
    }

    let autoplayId: ReturnType<typeof setInterval> | undefined;
    const startTimer = window.setTimeout(() => {
      autoplayId = swiffyslider.autoPlay(root, AUTOPLAY_MS, true);
    }, AUTOPLAY_START_DELAY_MS);

    return () => {
      window.clearTimeout(startTimer);
      if (autoplayId !== undefined) {
        window.clearInterval(autoplayId);
      }
    };
  }, [reduceMotion, zoomIndex]);

  useEffect(() => {
    if (previousSizeId.current === sizeId) {
      return;
    }
    previousSizeId.current = sizeId;
    const root = sliderRef.current;
    if (!root) {
      return;
    }
    swiffyslider.slideTo(root, PACKSHOT_SLIDE_INDEX);
    setActiveIndex(PACKSHOT_SLIDE_INDEX);
  }, [sizeId]);

  useEffect(() => {
    const rail = thumbsRailRef.current;
    if (!rail) {
      return;
    }

    const thumb = rail.querySelectorAll(".slider-indicators > *")[activeIndex];
    if (!(thumb instanceof HTMLElement)) {
      return;
    }

    const thumbLeft = thumb.offsetLeft;
    const thumbRight = thumbLeft + thumb.offsetWidth;
    const visibleLeft = rail.scrollLeft;
    const visibleRight = visibleLeft + rail.clientWidth;
    const edgePad = 20;

    if (thumbLeft < visibleLeft + edgePad) {
      rail.scrollTo({
        left: Math.max(0, thumbLeft - edgePad),
        behavior: reduceMotion ? "auto" : "smooth",
      });
      return;
    }

    if (thumbRight > visibleRight - edgePad) {
      rail.scrollTo({
        left: thumbRight - rail.clientWidth + edgePad,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [activeIndex, reduceMotion]);

  return (
    <div className="flex w-full flex-col">
      {/*
        Markup + class names from Swiffy Slider docs
        (https://www.swiffyslider.com/docs/ / npm readme).
        Swipe uses native CSS scroll-snap; JS only wires indicators + autoplay.
      */}
      <div
        className="swiffy-slider product-gallery-swiffy slider-item-nogap slider-item-snapstart slider-nav-nodelay slider-indicators-outside slider-indicators-sm"
        ref={sliderRef}
      >
        <div className="relative">
          <ul className="slider-container">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  className="relative overflow-hidden bg-surface"
                  key={slide.id}
                >
                  {slide.type === "video" ? (
                    <LayersVideo
                      className="absolute inset-0 size-full"
                      interactive={isActive}
                      pauseLabel={t("pauseAnimation")}
                      playLabel={t("playAnimation")}
                      poster={slide.poster ?? slide.thumb}
                      src={slide.src}
                    />
                  ) : (
                    <Image
                      alt={t(slide.altKey)}
                      className={cn(
                        "object-cover",
                        slide.objectPosition ?? "object-center",
                      )}
                      fill
                      fetchPriority={slide.id === "hero" ? "high" : "low"}
                      loading={slide.id === "hero" ? "eager" : "lazy"}
                      quality={GALLERY_QUALITY}
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      src={staticImageUrl(slide.src)}
                    />
                  )}

                  {slide.id === "hero" ? (
                    <div className="pointer-events-none absolute top-0 left-4 z-10 w-24">
                      <Image
                        alt={awardAlt}
                        className="h-auto w-full"
                        height={429}
                        src={staticImageUrl(awardSrc)}
                        width={256}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <ZoomButton label={t("zoomLabel")} onClick={() => openZoom()} />
        </div>

        <div className="product-gallery-thumbs" ref={thumbsRootRef}>
          <div className="product-gallery-thumbs-rail" ref={thumbsRailRef}>
            <div className="product-gallery-thumbs-track">
              <div className="slider-indicators">
                {slides.map((slide, index) => (
                  <button
                    aria-current={index === activeIndex ? "true" : undefined}
                    aria-label={t(slide.altKey)}
                    className={index === activeIndex ? "active" : undefined}
                    key={slide.id}
                    type="button"
                  >
                    <span className="relative block aspect-square overflow-hidden rounded-xl bg-surface">
                      {slide.type === "video" ? (
                        <LayersThumbVideo
                          key={slide.src}
                          objectPosition={
                            slide.objectPosition ?? "object-center"
                          }
                          poster={slide.thumb}
                          reduceMotion={reduceMotion}
                          src={slide.src}
                        />
                      ) : (
                        <Image
                          alt=""
                          className={cn(
                            "object-cover",
                            slide.objectPosition ?? "object-center",
                          )}
                          fill
                          key={slide.thumb}
                          sizes="72px"
                          src={staticImageUrl(slide.thumb)}
                          unoptimized
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <span aria-hidden className="product-gallery-thumb-bar" />
            </div>
          </div>
        </div>
      </div>

      {zoomIndex !== null ? (
        <ProductGalleryLightbox
          closeLabel={t("closeZoom")}
          images={slides.map((slide) => ({
            id: slide.id,
            type: slide.type,
            src: slide.src,
            alt: t(slide.altKey),
            poster: slide.poster ?? slide.thumb,
            objectPosition: slide.objectPosition,
          }))}
          index={zoomIndex}
          nextLabel={t("nextImage")}
          onClose={() => setZoomIndex(null)}
          onIndexChange={setZoomIndex}
          previousLabel={t("previousImage")}
          renderVideo={(item) => (
            <LayersVideo
              className="absolute inset-0 size-full"
              contain
              key={item.src}
              pauseLabel={t("pauseAnimation")}
              playLabel={t("playAnimation")}
              poster={item.poster ?? item.src}
              src={item.src}
            />
          )}
          title={t("zoomLabel")}
        />
      ) : null}
    </div>
  );
}

function DesktopGallery({
  awardAlt,
  awardSrc,
  packshot,
  sizeId,
}: {
  awardAlt: string;
  awardSrc: string;
  packshot: string;
  sizeId: MattressSizeId;
}) {
  const t = useTranslations("productOriginal.hero.gallery");
  const locale = useLocale();
  const previousSizeId = useRef(sizeId);
  const [sizeActive, setSizeActive] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const benefits = benefitsSrc(locale);

  useEffect(() => {
    if (previousSizeId.current === sizeId) {
      return;
    }
    previousSizeId.current = sizeId;
    setSizeActive(true);
  }, [sizeId]);

  const mainSrc = sizeActive ? packshot : GALLERY.hero;
  const mainAlt = sizeActive ? t("packshotAlt") : t("heroAlt");
  const tileSrc = sizeActive ? GALLERY.hero : packshot;
  const tileAlt = sizeActive ? t("heroAlt") : t("packshotAlt");
  const layersVideo = layersAnimationSrc(sizeId);
  const layersThumb = layersThumbSrc(sizeId);
  const lightboxImages = [
    { id: "main", type: "image" as const, src: mainSrc, alt: mainAlt },
    { id: "tile", type: "image" as const, src: tileSrc, alt: tileAlt },
    {
      id: "lifestyle",
      type: "image" as const,
      src: GALLERY.lifestyle,
      alt: t("lifestyleAlt"),
    },
    {
      id: "layers",
      type: "video" as const,
      src: layersVideo,
      alt: t("layersAlt"),
      poster: layersThumb,
    },
    {
      id: "benefits",
      type: "image" as const,
      src: benefits,
      alt: t("benefitsAlt"),
      objectPosition: "object-top",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative w-full bg-surface pt-[100%]">
        <Image
          alt={mainAlt}
          className="object-cover object-center"
          fill
          fetchPriority="high"
          key={mainSrc}
          loading="eager"
          quality={GALLERY_QUALITY}
          sizes="(min-width: 1024px) 55vw, 100vw"
          src={staticImageUrl(mainSrc)}
        />
        <button
          aria-haspopup="dialog"
          aria-label={t("zoomLabel")}
          className="absolute inset-0 z-1 cursor-zoom-in"
          onClick={() => setZoomIndex(0)}
          type="button"
        />

        <div className="pointer-events-none absolute top-0 left-5 z-10 w-28 lg:left-10">
          <Image
            alt={awardAlt}
            className="h-auto w-full"
            height={429}
            src={staticImageUrl(awardSrc)}
            width={256}
          />
        </div>

        <ZoomButton label={t("zoomLabel")} onClick={() => setZoomIndex(0)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GalleryTile
          alt={tileAlt}
          onOpen={() => setZoomIndex(1)}
          src={tileSrc}
          zoomLabel={t("zoomLabel")}
        />
        <GalleryTile
          alt={t("lifestyleAlt")}
          onOpen={() => setZoomIndex(2)}
          src={GALLERY.lifestyle}
          zoomLabel={t("zoomLabel")}
        />
        <div className="relative">
          <button
            aria-haspopup="dialog"
            aria-label={t("zoomLabel")}
            className="absolute inset-0 z-0 cursor-zoom-in"
            onClick={() => setZoomIndex(3)}
            type="button"
          />
          <LayersVideo
            className="relative aspect-390/488"
            key={layersVideo}
            pauseLabel={t("pauseAnimation")}
            playLabel={t("playAnimation")}
            poster={layersThumb}
            src={layersVideo}
          />
        </div>
        <GalleryTile
          alt={t("benefitsAlt")}
          objectPosition="object-top"
          onOpen={() => setZoomIndex(4)}
          src={benefits}
          zoomLabel={t("zoomLabel")}
        />
      </div>

      {zoomIndex !== null ? (
        <ProductGalleryLightbox
          closeLabel={t("closeZoom")}
          images={lightboxImages}
          index={zoomIndex}
          nextLabel={t("nextImage")}
          onClose={() => setZoomIndex(null)}
          onIndexChange={setZoomIndex}
          previousLabel={t("previousImage")}
          renderVideo={(item) => (
            <LayersVideo
              className="absolute inset-0 size-full"
              contain
              key={item.src}
              pauseLabel={t("pauseAnimation")}
              playLabel={t("playAnimation")}
              poster={item.poster ?? layersThumb}
              src={item.src}
            />
          )}
          title={t("zoomLabel")}
        />
      ) : null}
    </div>
  );
}

const DESKTOP_MQ = "(min-width: 1024px)";

function useIsDesktopGallery() {
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

export function ProductMediaGallery({
  awardAlt,
  awardSrc,
}: {
  awardAlt: string;
  awardSrc: string;
}) {
  const sizeId = useOriginalSizeStore((state) => state.sizeId);
  const packshot = packshotSrc(sizeId);
  const isDesktop = useIsDesktopGallery();

  return isDesktop ? (
    <DesktopGallery
      awardAlt={awardAlt}
      awardSrc={awardSrc}
      packshot={packshot}
      sizeId={sizeId}
    />
  ) : (
    <MobileGallery
      awardAlt={awardAlt}
      awardSrc={awardSrc}
      packshot={packshot}
      sizeId={sizeId}
    />
  );
}
