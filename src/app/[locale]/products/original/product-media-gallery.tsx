"use client";

import { Pause, Play, ZoomIn } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  galleryChromeButtonClassName,
  ProductGalleryLightbox,
} from "@/components/product/product-gallery-lightbox";
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

const SLIDE_ORDER: SlideId[] = [
  "hero",
  "packshot",
  "lifestyle",
  "layers",
  "benefits",
];

const slideTransition = {
  type: "tween" as const,
  duration: 0.42,
  ease: [0.32, 0.72, 0, 1] as const,
};

const barTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.8,
};

const mainSlideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? "100%" : "-100%",
  }),
  center: { x: 0 },
  exit: (direction: number) => ({
    x: direction >= 0 ? "-100%" : "100%",
  }),
};

function slideDirection(fromId: SlideId, toId: SlideId) {
  const from = SLIDE_ORDER.indexOf(fromId);
  const to = SLIDE_ORDER.indexOf(toId);
  if (from === SLIDE_ORDER.length - 1 && to === 0) return 1;
  if (from === 0 && to === SLIDE_ORDER.length - 1) return -1;
  return to >= from ? 1 : -1;
}

function LayersVideo({
  contain,
  pauseLabel,
  playLabel,
  poster,
  src,
  className,
}: {
  contain?: boolean;
  pauseLabel: string;
  playLabel: string;
  poster: string;
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          video.load();
          void video
            .play()
            .then(() => setPlaying(true))
            .catch(() => {});
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

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
        "relative overflow-hidden bg-surface",
        contain && "flex items-center justify-center",
        className,
      )}
    >
      <video
        className={
          contain
            ? "h-auto w-auto max-h-[min(100%,1080px)] max-w-[min(100%,908px)] object-contain"
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

      <button
        aria-label={playing ? pauseLabel : playLabel}
        className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
        onClick={togglePlayback}
        onPointerDown={(event) => event.stopPropagation()}
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

function GalleryTile({
  src,
  alt,
  zoomLabel,
  priority,
  objectPosition = "object-center",
  onOpen,
}: {
  src: string;
  alt: string;
  zoomLabel: string;
  priority?: boolean;
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
        priority={priority}
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
      <ZoomButton label={zoomLabel} onClick={onOpen} />
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
const CLICK_PAUSE_MS = 7000;

function MobileGallery({
  awardAlt,
  packshot,
  sizeId,
}: {
  awardAlt: string;
  packshot: string;
  sizeId: MattressSizeId;
}) {
  const t = useTranslations("productOriginal.hero.gallery");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<SlideId>("hero");
  const [direction, setDirection] = useState(1);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const pauseAutoplayRef = useRef<() => void>(() => {});
  const previousSizeId = useRef(sizeId);
  const slides = gallerySlides(
    packshot,
    packshotThumbSrc(sizeId),
    layersAnimationSrc(sizeId),
    layersThumbSrc(sizeId),
    layersStripThumbSrc(sizeId),
    benefitsSrc(locale),
    benefitsThumbSrc(locale),
  );
  const active = slides.find((slide) => slide.id === activeId) ?? slides[0];
  const duration = reduceMotion ? 0 : slideTransition.duration;

  function openZoom(id: SlideId = activeId) {
    const nextIndex = slides.findIndex((slide) => slide.id === id);
    if (nextIndex >= 0) {
      setZoomIndex(nextIndex);
    }
    pauseAutoplayRef.current();
  }

  function goTo(nextId: SlideId) {
    if (nextId !== activeId) {
      setDirection(slideDirection(activeId, nextId));
      setActiveId(nextId);
    }
    pauseAutoplayRef.current();
  }

  useEffect(() => {
    if (previousSizeId.current === sizeId) {
      return;
    }
    previousSizeId.current = sizeId;
    setDirection(1);
    setActiveId("packshot");
    pauseAutoplayRef.current();
  }, [sizeId]);

  useEffect(() => {
    if (reduceMotion || zoomIndex !== null) {
      pauseAutoplayRef.current = () => {};
      return;
    }

    let timer: number | null = null;

    function clear() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    function schedule(delayMs: number) {
      clear();
      timer = window.setTimeout(() => {
        setDirection(1);
        setActiveId((current) => {
          const index = SLIDE_ORDER.indexOf(current);
          return SLIDE_ORDER[(index + 1) % SLIDE_ORDER.length] ?? "hero";
        });
        schedule(AUTOPLAY_MS);
      }, delayMs);
    }

    pauseAutoplayRef.current = () => schedule(CLICK_PAUSE_MS);
    schedule(AUTOPLAY_MS);

    return () => {
      clear();
      pauseAutoplayRef.current = () => {};
    };
  }, [reduceMotion, zoomIndex]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative w-full overflow-hidden bg-surface pt-[100%]">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            animate="center"
            className="absolute inset-0"
            custom={direction}
            exit="exit"
            initial="enter"
            key={active.id}
            transition={{ ...slideTransition, duration }}
            variants={mainSlideVariants}
          >
            {active.type === "video" ? (
              <LayersVideo
                className="absolute inset-0 size-full"
                key={active.src}
                pauseLabel={t("pauseAnimation")}
                playLabel={t("playAnimation")}
                poster={active.poster ?? active.thumb}
                src={active.src}
              />
            ) : (
              <Image
                alt={t(active.altKey)}
                className={cn(
                  "object-cover",
                  active.objectPosition ?? "object-center",
                )}
                fill
                loading={active.id === "hero" ? "eager" : undefined}
                priority={active.id === "hero"}
                quality={GALLERY_QUALITY}
                sizes="(min-width: 1024px) 55vw, 100vw"
                src={staticImageUrl(active.src)}
              />
            )}

            {active.id === "hero" ? (
              <div className="pointer-events-none absolute top-0 left-4 z-10 w-24">
                <Image
                  alt={awardAlt}
                  className="w-full"
                  height={192}
                  src={staticImageUrl("/images/13-time-award.webp")}
                  style={{ width: "100%", height: "auto" }}
                  width={112}
                />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {active.type === "image" ? (
          <button
            aria-haspopup="dialog"
            aria-label={t("zoomLabel")}
            className="absolute inset-0 z-1 cursor-zoom-in"
            onClick={() => openZoom(activeId)}
            type="button"
          />
        ) : null}

        <ZoomButton label={t("zoomLabel")} onClick={() => openZoom(activeId)} />
      </div>

      <div className="relative px-5 pb-1">
        <LayoutGroup id="mobile-gallery-thumbs">
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {slides.map((slide) => {
              const selected = slide.id === activeId;
              return (
                <button
                  aria-current={selected ? "true" : undefined}
                  aria-label={t(slide.altKey)}
                  className="relative w-18 shrink-0 cursor-pointer pb-2"
                  key={slide.id}
                  onClick={() => goTo(slide.id)}
                  type="button"
                >
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-surface">
                    <Image
                      alt=""
                      className={cn(
                        "object-cover",
                        slide.objectPosition ?? "object-center",
                      )}
                      fill
                      key={slide.thumb}
                      loading="eager"
                      sizes="72px"
                      src={staticImageUrl(slide.thumb)}
                      unoptimized
                    />
                  </span>
                  {selected ? (
                    <motion.span
                      className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand"
                      layoutId="mobile-gallery-active-bar"
                      transition={
                        reduceMotion ? { duration: 0 } : barTransition
                      }
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
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
  packshot,
  sizeId,
}: {
  awardAlt: string;
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
          key={mainSrc}
          loading="eager"
          priority
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
            className="w-full"
            height={192}
            priority
            src={staticImageUrl("/images/13-time-award.webp")}
            style={{ width: "100%", height: "auto" }}
            width={112}
          />
        </div>

        <ZoomButton label={t("zoomLabel")} onClick={() => setZoomIndex(0)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GalleryTile
          alt={tileAlt}
          onOpen={() => setZoomIndex(1)}
          priority
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
          <LayersVideo
            className="aspect-390/488"
            key={layersVideo}
            pauseLabel={t("pauseAnimation")}
            playLabel={t("playAnimation")}
            poster={layersThumb}
            src={layersVideo}
          />
          <ZoomButton label={t("zoomLabel")} onClick={() => setZoomIndex(3)} />
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

export function ProductMediaGallery({ awardAlt }: { awardAlt: string }) {
  const sizeId = useOriginalSizeStore((state) => state.sizeId);
  const packshot = packshotSrc(sizeId);
  const isDesktop = useIsDesktopGallery();

  return isDesktop ? (
    <DesktopGallery awardAlt={awardAlt} packshot={packshot} sizeId={sizeId} />
  ) : (
    <MobileGallery awardAlt={awardAlt} packshot={packshot} sizeId={sizeId} />
  );
}
