"use client";

import { ChevronLeft, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  ConfiguratorCategoryToggle,
  ConfiguratorFirmnessScale,
  ConfiguratorPreferenceField,
  ConfiguratorRangeField,
  ConfiguratorSizeList,
} from "@/app/[locale]/configurator/configurator-controls";
import {
  type ConfiguratorClip,
  ConfiguratorVideos,
} from "@/app/[locale]/configurator/configurator-videos";
import { ResultLayerStack } from "@/app/[locale]/configurator/result-layer-stack";
import { SaleBadge, SalePrice } from "@/components/product/sale-price";
import { useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import {
  type BedKind,
  CONFIGURATOR_DEFAULT_SIZE_ID,
  configuratorCartVariant,
  DEFAULT_PREFERENCE,
  DEFAULT_WEIGHT_KG,
  type Firmness,
  isMindTheGapTogether,
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  preloadConfiguratorIntro,
  preloadConfiguratorPosters,
  type Sleeping,
  suggestedSingleSizeId,
  VIDEO_PLAYBACK_RATE,
  VIDEO_PLAYBACK_RATE_CLOSE_SNAP,
} from "@/lib/configurator";
import type { ConfiguratorLayerId } from "@/lib/configurator-layer-stack";
import { cutoutFirmnessForSleeper } from "@/lib/configurator-layer-stack";
import {
  defaultVisualState,
  resolveVisual,
  videoMode,
} from "@/lib/configurator-video-map";
import { configuratorCartProductId } from "@/lib/product-catalog";
import {
  DOUBLE_MATTRESS_SIZES,
  formatMattPrice,
  getMattressSize,
  isDoubleMattressSize,
  type MattressSizeId,
  mattressCompareCents,
  mattressSaleCents,
  mattressSaveCents,
  SINGLE_MATTRESS_SIZES,
} from "@/lib/product-original-sizes";
import { trackConfiguratorFinished } from "@/lib/tracking/client/configurator";
import { trackAddedCartItems } from "@/lib/tracking/client/ecommerce";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

type Advice = {
  text: string;
  more: string;
};

const DESKTOP_MQ = "(min-width: 1024px)";

/** Deepest overflow-y scrollport inside `root` that currently has overflow. */
function findScrollable(root: HTMLElement): HTMLElement | null {
  const nodes: HTMLElement[] = [
    root,
    ...root.querySelectorAll<HTMLElement>("*"),
  ];
  let match: HTMLElement | null = null;
  for (const el of nodes) {
    const { overflowY } = getComputedStyle(el);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 1
    ) {
      match = el;
    }
  }
  return match;
}

type ConfiguratorSectionProps = {
  onDismiss?: () => void;
};

export function ConfiguratorSection({ onDismiss }: ConfiguratorSectionProps) {
  const t = useTranslations("configuratorPage");
  const tHero = useTranslations("productOriginal.hero");
  const productName = tHero("subtitle");
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const sizeFieldId = useId();

  const scale = t.raw("scale") as string[];
  const advice = t.raw("advice") as Advice[];
  const layerLabels = t.raw("layers") as Record<ConfiguratorLayerId, string>;
  const togetherScale = [t("soft"), t("medium"), t("firm")];

  const [step, setStep] = useState<Step>(1);
  const [sizeId, setSizeId] = useState<MattressSizeId>(
    CONFIGURATOR_DEFAULT_SIZE_ID,
  );
  const [sleeping, setSleeping] = useState<Sleeping>("alone");
  const [yourWeight, setYourWeight] = useState(DEFAULT_WEIGHT_KG);
  const [yourPreference, setYourPreference] = useState(DEFAULT_PREFERENCE);
  const [partnerWeight, setPartnerWeight] = useState(DEFAULT_WEIGHT_KG);
  const [partnerPreference, setPartnerPreference] =
    useState(DEFAULT_PREFERENCE);
  const [you, setYou] = useState<Firmness>(3);
  const [partner, setPartner] = useState<Firmness>(3);
  const [mindTheGap, setMindTheGap] = useState(false);
  const [clip, setClip] = useState<ConfiguratorClip | null>(null);
  const [playbackRate, setPlaybackRate] = useState(VIDEO_PLAYBACK_RATE);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [stageReady, setStageReady] = useState(false);
  const [sizeSheetOpen, setSizeSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSleeper, setActiveSleeper] = useState<1 | 2>(1);
  const [youMore, setYouMore] = useState(false);
  const [partnerMore, setPartnerMore] = useState(false);
  const [formHeight, setFormHeight] = useState<number>();
  const formInnerRef = useRef<HTMLDivElement>(null);
  const visualPanelRef = useRef<HTMLDivElement>(null);

  const clipIdRef = useRef(0);
  const shownStateRef = useRef(defaultVisualState("single"));
  const clipBedRef = useRef<BedKind>("single");
  const playingClipRef = useRef<ConfiguratorClip | null>(null);
  const pendingPackagingRef = useRef(false);
  /** Step to land on after open/close intro finishes — keep current UI until then. */
  const pendingStepRef = useRef<Step | null>(null);
  const profileRef = useRef({
    yourWeight,
    yourPreference,
    partnerWeight,
    partnerPreference,
  });
  profileRef.current = {
    yourWeight,
    yourPreference,
    partnerWeight,
    partnerPreference,
  };

  const bed = isDoubleMattressSize(sizeId) ? "double" : "single";
  const together = bed === "double" && sleeping === "together";
  const showPartnerScale = together && (step === 3 || step === 4);
  const showOverlay = step === 3 || step === 4;
  const confirmLoading = controlsLocked && (step === 1 || step === 2);

  const sizes =
    bed === "double" ? DOUBLE_MATTRESS_SIZES : SINGLE_MATTRESS_SIZES;

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    preloadConfiguratorPosters();
  }, []);

  // Warm only the opening clip for the selected bed — after idle time so
  // rapid size toggles don’t fight the network/decoder.
  useEffect(() => {
    if (step !== 1) {
      return;
    }
    const handle = window.setTimeout(() => {
      preloadConfiguratorIntro(bed);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [step, bed]);

  useLayoutEffect(() => {
    if (isDesktop || step === 5) {
      setFormHeight(undefined);
      return;
    }

    const node = formInnerRef.current;
    if (!node) {
      return;
    }

    const update = () => {
      setFormHeight(Math.ceil(node.scrollHeight));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isDesktop, step]);

  // Desktop: wheel over the mattress stage scrolls the form panel instead.
  useEffect(() => {
    const visual = visualPanelRef.current;
    const form = formInnerRef.current;
    if (!visual || !form) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (!window.matchMedia(DESKTOP_MQ).matches) {
        return;
      }
      if (event.ctrlKey) {
        return;
      }

      const scrollable = findScrollable(form);
      if (!scrollable) {
        return;
      }

      const top = scrollable.scrollTop;
      const max = scrollable.scrollHeight - scrollable.clientHeight;
      const next = Math.min(max, Math.max(0, top + event.deltaY));
      if (next === top) {
        return;
      }

      event.preventDefault();
      scrollable.scrollTop = next;
    };

    visual.addEventListener("wheel", onWheel, { passive: false });
    return () => visual.removeEventListener("wheel", onWheel);
  }, []);

  function setProfileValue(
    key: keyof typeof profileRef.current,
    value: number,
  ) {
    profileRef.current = { ...profileRef.current, [key]: value };
    if (key === "yourWeight") setYourWeight(value);
    if (key === "yourPreference") setYourPreference(value);
    if (key === "partnerWeight") setPartnerWeight(value);
    if (key === "partnerPreference") setPartnerPreference(value);
  }

  function currentResolution() {
    return resolveVisual({
      bed,
      sleeping,
      profile: profileRef.current,
    });
  }

  function applyRecommendation() {
    const next = currentResolution();
    setYou(next.youLevel);
    setPartner(next.partnerLevel);
    setMindTheGap(
      together ? isMindTheGapTogether(next.youLevel, next.partnerLevel) : false,
    );
    return next;
  }

  function startClip(nextClip: ConfiguratorClip) {
    playingClipRef.current = nextClip;
    setClip(nextClip);
    // Never trap controls on result handoffs or silent end-frame snaps.
    const keepInteractive =
      nextClip.kind === "packaging" ||
      nextClip.kind === "hold" ||
      (nextClip.kind === "intro" && nextClip.reverse && nextClip.snapClose);
    setControlsLocked(!keepInteractive);
  }

  function unlockControls() {
    playingClipRef.current = null;
    setControlsLocked(false);
    setPlaybackRate(VIDEO_PLAYBACK_RATE);
  }

  function playIntro(afterStep: Step) {
    clipIdRef.current += 1;
    const mode = videoMode(bed, sleeping);
    shownStateRef.current = defaultVisualState(mode);
    clipBedRef.current = bed;
    pendingStepRef.current = afterStep;
    startClip({
      id: clipIdRef.current,
      kind: "intro",
      bed,
    });
    applyRecommendation();
  }

  function playIntroReverse(afterStep: Step) {
    clipIdRef.current += 1;
    setStageReady(false);
    pendingStepRef.current = afterStep;
    startClip({
      id: clipIdRef.current,
      kind: "intro",
      bed,
      reverse: true,
    });
  }

  function playTransition(from: number, to: number, clipBed: BedKind) {
    clipIdRef.current += 1;
    setPlaybackRate(VIDEO_PLAYBACK_RATE);
    startClip({
      id: clipIdRef.current,
      kind: "transition",
      bed,
      clipBed,
      from,
      to,
    });
  }

  function playPackaging() {
    startClosingThenPackaging();
  }

  function startClosingThenPackaging() {
    // Result step: close mattress, then package — no firmness transitions.
    pendingPackagingRef.current = true;
    playClose();
  }

  function playClose() {
    clipIdRef.current += 1;
    // Snap: seek mid-fold + high rate so default open pose never reads.
    setPlaybackRate(VIDEO_PLAYBACK_RATE_CLOSE_SNAP);
    startClip({
      id: clipIdRef.current,
      kind: "intro",
      bed,
      reverse: true,
      snapClose: true,
    });
  }

  function startPackaging() {
    pendingPackagingRef.current = false;
    clipIdRef.current += 1;
    setPlaybackRate(1);
    startClip({
      id: clipIdRef.current,
      kind: "packaging",
      bed,
    });
  }

  /** Instant end-frame of the firmness state — no open/transition playback. */
  function playHold(state: number, clipBed: BedKind) {
    pendingPackagingRef.current = false;
    clipIdRef.current += 1;
    setPlaybackRate(VIDEO_PLAYBACK_RATE);
    const mode = videoMode(bed, sleeping);
    startClip({
      id: clipIdRef.current,
      kind: "hold",
      bed,
      clipBed,
      state,
      defaultState: defaultVisualState(mode),
    });
  }

  function enqueueState(target: number, clipBed: BedKind) {
    if (!stageReady) {
      return;
    }
    // Silent snaps must not block the next firmness transition.
    const playing = playingClipRef.current;
    if (
      playing != null &&
      playing.kind !== "hold" &&
      playing.kind !== "packaging"
    ) {
      return;
    }
    if (shownStateRef.current === target) {
      return;
    }
    clipBedRef.current = clipBed;
    playTransition(shownStateRef.current, target, clipBed);
  }

  function commitProfiles(sleeper: 1 | 2) {
    if (controlsLocked) {
      return;
    }
    setActiveSleeper(sleeper);
    const next = applyRecommendation();
    enqueueState(next.state, next.clipBed);
  }

  function handleClipEnded(played: ConfiguratorClip) {
    playingClipRef.current = null;

    if (played.kind === "packaging") {
      unlockControls();
      return;
    }

    if (played.kind === "hold") {
      shownStateRef.current = played.state;
      clipBedRef.current = played.clipBed;
      setStageReady(true);
      unlockControls();
      return;
    }

    if (played.kind === "intro") {
      const mode = videoMode(bed, sleeping);
      // Keep the open firmness state through the packaging close — reverse is
      // only a visual handoff, not a reset to the default stack.
      if (!(played.reverse && pendingPackagingRef.current)) {
        shownStateRef.current = defaultVisualState(mode);
      }
      clipBedRef.current = bed;
      if (played.reverse) {
        if (pendingPackagingRef.current) {
          startPackaging();
          return;
        }
        const afterStep = pendingStepRef.current;
        pendingStepRef.current = null;
        if (afterStep != null) {
          setStep(afterStep);
        }
        unlockControls();
        setStageReady(false);
        return;
      }
      setStageReady(true);
      setActiveSleeper(1);
      const next = currentResolution();
      setYou(next.youLevel);
      setPartner(next.partnerLevel);
      setMindTheGap(
        together
          ? isMindTheGapTogether(next.youLevel, next.partnerLevel)
          : false,
      );
      const afterStep = pendingStepRef.current;
      pendingStepRef.current = null;
      if (afterStep != null) {
        setStep(afterStep);
      }
      if (pendingPackagingRef.current) {
        startClosingThenPackaging();
        return;
      }
      if (next.state !== shownStateRef.current) {
        playTransition(shownStateRef.current, next.state, next.clipBed);
        return;
      }
      unlockControls();
      return;
    }

    shownStateRef.current = played.to;
    clipBedRef.current = played.clipBed;

    if (pendingPackagingRef.current) {
      startClosingThenPackaging();
      return;
    }

    unlockControls();
  }

  function handleCategory(category: "single" | "double") {
    if (controlsLocked) {
      return;
    }
    if (category === "single" && bed !== "single") {
      setSizeId(SINGLE_MATTRESS_SIZES[0]?.id ?? CONFIGURATOR_DEFAULT_SIZE_ID);
      setSleeping("alone");
      pendingPackagingRef.current = false;
      pendingStepRef.current = null;
      playingClipRef.current = null;
      setClip(null);
      setStageReady(false);
      setControlsLocked(false);
    }
    if (category === "double" && bed !== "double") {
      setSizeId(DOUBLE_MATTRESS_SIZES[0]?.id ?? "140x200");
      pendingPackagingRef.current = false;
      pendingStepRef.current = null;
      playingClipRef.current = null;
      setClip(null);
      setStageReady(false);
      setControlsLocked(false);
    }
  }

  function handleConfirm() {
    if (controlsLocked) {
      return;
    }

    if (step === 1) {
      if (bed === "single") {
        playIntro(3);
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      playIntro(3);
      return;
    }

    applyRecommendation();

    if (step === 3 && together && !isDesktop) {
      setActiveSleeper(2);
      setStep(4);
      return;
    }

    setStep(5);
    playPackaging();
    trackConfiguratorFinished({
      bed,
      sleeping,
      size_id: sizeId,
    });
  }

  function handleBack() {
    if (controlsLocked) {
      return;
    }
    if (step === 1) {
      if (onDismiss) {
        onDismiss();
        return;
      }
      router.back();
      return;
    }
    if (step === 3 && bed === "single") {
      playIntroReverse(1);
      return;
    }
    if (step === 3) {
      playIntroReverse(2);
      return;
    }
    if (step === 4) {
      setActiveSleeper(1);
      setStep(3);
      return;
    }
    if (step === 5) {
      const next = together && !isDesktop ? 4 : 3;
      setActiveSleeper(next === 4 ? 2 : 1);
      setStep(next);
      const resolution = currentResolution();
      shownStateRef.current = resolution.state;
      clipBedRef.current = resolution.clipBed;
      setStageReady(true);
      playHold(resolution.state, resolution.clipBed);
      return;
    }
    setStep((current) => (current - 1) as Step);
  }

  function handleAddToCart() {
    const splitId = mindTheGap ? suggestedSingleSizeId(sizeId) : null;
    const cartSizeId = splitId ?? sizeId;
    const size = getMattressSize(cartSizeId);
    const youLabel = (together ? togetherScale : scale)[you - 1] ?? "";
    const partnerLabel = (together ? togetherScale : scale)[partner - 1] ?? "";
    const quantity = splitId ? 2 : 1;
    const product = {
      id: configuratorCartProductId(
        cartSizeId,
        you,
        together ? partner : undefined,
      ),
      name: productName,
      price: size.plusCents / 100,
      image: "/images/product-gallery/hero-square.webp",
      variant: configuratorCartVariant({
        sizeId: cartSizeId,
        sleeping,
        bed: splitId ? "single" : bed,
        you,
        partner,
        youLabel,
        partnerLabel,
        mindTheGap,
      }),
    };

    addItem(product, quantity);
    trackAddedCartItems([{ ...product, quantity }], "configurator");
    openCart();
  }

  const youCutout = cutoutFirmnessForSleeper({
    bed,
    sleeping,
    weightKg: yourWeight,
    preference: yourPreference,
  });
  const partnerCutout = cutoutFirmnessForSleeper({
    bed,
    sleeping,
    weightKg: partnerWeight,
    preference: partnerPreference,
  });
  const youAdvice = advice[youCutout - 1];
  const partnerAdvice = advice[partnerCutout - 1];
  const sizeLabel = getMattressSize(sizeId).label;
  const resultSplitId = mindTheGap ? suggestedSingleSizeId(sizeId) : null;
  const resultSize = getMattressSize(resultSplitId ?? sizeId);
  const resultQuantity = resultSplitId ? 2 : 1;
  const resultSaleCents = mattressSaleCents(resultSize) * resultQuantity;
  const resultCompareCents = mattressCompareCents(resultSize) * resultQuantity;
  const resultSaveCents = mattressSaveCents(resultSize) * resultQuantity;
  const backLabel =
    step === 1 || step === 5 ? t("goBack") : t("previousQuestion");

  return (
    <section className="relative flex h-dvh flex-col-reverse overflow-x-hidden overflow-y-hidden bg-white lg:flex-row lg:justify-end">
      <div
        className={cn(
          "configurator-form-panel z-10 flex w-full min-w-0 flex-col overflow-hidden bg-white lg:h-auto lg:min-h-0 lg:w-[40%]",
          step === 5
            ? "min-h-0 flex-1 max-lg:transition-none lg:flex-none"
            : "shrink-0",
        )}
        style={
          !isDesktop && step !== 5 && formHeight != null
            ? { height: formHeight }
            : undefined
        }
      >
        <div
          className={cn(
            "flex w-full min-w-0 flex-col lg:h-full",
            step === 5 && "h-full min-h-0 overflow-hidden",
          )}
          ref={formInnerRef}
        >
          <div
            className={cn(
              "min-w-0 p-5 lg:min-h-0 lg:flex-1 lg:p-0 lg:px-10 lg:pt-12 lg:pb-4",
              step === 1
                ? "pb-8 lg:flex lg:flex-col lg:overflow-hidden"
                : "pb-4",
              step === 5 && "min-h-0 flex-1 overflow-y-auto overscroll-contain",
              step !== 1 && step !== 5 && "lg:overflow-y-auto",
              // Result step stays interactive while packaging plays — only back locks.
              controlsLocked && step !== 5 && "pointer-events-none opacity-60",
            )}
            inert={controlsLocked && step !== 5 ? true : undefined}
          >
            {step === 1 ? (
              <>
                <div className="flex flex-col lg:hidden">
                  <h1 className="mb-3 font-bold font-heading text-[20px] text-brand-dark">
                    {t("sizeTitle")}
                  </h1>
                  <button
                    className="flex h-[52px] w-full items-center justify-between rounded-full border border-grey py-1 pr-5 pl-4 text-brand-dark"
                    onClick={() => setSizeSheetOpen(true)}
                    type="button"
                  >
                    <span>{sizeLabel}</span>
                    <ChevronLeft className="size-2.5 -rotate-90" />
                  </button>
                </div>

                <div className="hidden min-h-0 flex-1 flex-col lg:flex">
                  <h1 className="mb-6 shrink-0 font-bold font-heading text-brand-dark text-xl">
                    {t("sizeTitle")}
                  </h1>
                  <ConfiguratorCategoryToggle
                    category={bed}
                    doubleLabel={t("double")}
                    onChange={handleCategory}
                    singleLabel={t("single")}
                  />
                  <p className="mt-4 shrink-0 text-brand-dark/70 text-sm leading-relaxed">
                    {t("sizeHint")}
                  </p>
                  <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
                    <ConfiguratorSizeList
                      onSelect={setSizeId}
                      selectedId={sizeId}
                      sizes={sizes}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h2 className="mb-2 font-bold font-heading text-brand-dark text-lg lg:mb-6 lg:text-xl">
                  {t("whoTitle")}
                </h2>
                <div className="flex flex-col gap-3">
                  <SleepingOption
                    checked={sleeping === "alone"}
                    label={t("alone")}
                    name={sizeFieldId}
                    onSelect={() => setSleeping("alone")}
                  />
                  <SleepingOption
                    checked={sleeping === "together"}
                    label={t("together")}
                    name={sizeFieldId}
                    onSelect={() => setSleeping("together")}
                  />
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <h2 className="mb-6 hidden font-bold font-heading text-[32px] text-brand-dark lg:block">
                  {together ? t("weightTitleTogether") : t("weightTitle")}
                </h2>
                <h2 className="mb-4 font-bold font-heading text-brand-dark text-lg lg:mb-6 lg:hidden">
                  {t("weightTitle")}
                </h2>
                <div
                  className={cn(
                    "flex flex-col gap-2 lg:gap-8",
                    together && "lg:mt-8",
                  )}
                >
                  {together ? (
                    <h3 className="lg:!text-[20px] hidden font-bold font-heading text-base text-brand-dark lg:block">
                      {t("you")}:
                    </h3>
                  ) : null}
                  <ProfileFields
                    firmLabel={t("firm")}
                    mediumLabel={t("medium")}
                    onCommit={() => commitProfiles(1)}
                    onPreference={(value) =>
                      setProfileValue("yourPreference", value)
                    }
                    onWeight={(value) => setProfileValue("yourWeight", value)}
                    perfectFor={t("perfectFor")}
                    preference={yourPreference}
                    prefix="you"
                    softLabel={t("soft")}
                    weight={yourWeight}
                    weightSuffix={t("weightSuffix")}
                  />
                </div>
                {together ? (
                  <div className="mt-10 hidden flex-col gap-2 lg:flex lg:gap-8">
                    <h3 className="lg:!text-[20px] hidden font-bold font-heading text-brand-dark lg:block">
                      {t("partner")}:
                    </h3>
                    <ProfileFields
                      firmLabel={t("firm")}
                      mediumLabel={t("medium")}
                      onCommit={() => commitProfiles(2)}
                      onPreference={(value) =>
                        setProfileValue("partnerPreference", value)
                      }
                      onWeight={(value) =>
                        setProfileValue("partnerWeight", value)
                      }
                      perfectFor={t("perfectFor")}
                      preference={partnerPreference}
                      prefix="partner"
                      softLabel={t("soft")}
                      weight={partnerWeight}
                      weightSuffix={t("weightSuffix")}
                    />
                  </div>
                ) : null}
              </>
            ) : null}

            {step === 4 ? (
              <>
                <h2 className="mb-4 font-bold font-heading text-brand-dark text-lg lg:mb-6">
                  {t("partnerWeightTitle")}
                </h2>
                <ProfileFields
                  firmLabel={t("firm")}
                  mediumLabel={t("medium")}
                  onCommit={() => commitProfiles(2)}
                  onPreference={(value) =>
                    setProfileValue("partnerPreference", value)
                  }
                  onWeight={(value) => setProfileValue("partnerWeight", value)}
                  perfectFor={t("perfectFor")}
                  preference={partnerPreference}
                  prefix="partner-mobile"
                  softLabel={t("soft")}
                  weight={partnerWeight}
                  weightSuffix={t("weightSuffix")}
                />
              </>
            ) : null}

            {step === 5 ? (
              <div>
                <h2 className="mb-4 font-bold font-heading text-2xl text-brand-dark lg:text-[32px]">
                  {t("resultTitle")}
                </h2>
                <p className="text-base text-brand-dark leading-relaxed lg:text-lg">
                  {together
                    ? mindTheGap
                      ? t("resultNoMatch")
                      : t("resultMatch")
                    : t("resultSolo")}
                </p>

                <ResultLayerStack
                  firmness={youCutout}
                  heading={together ? t("yourResult") : undefined}
                  labels={layerLabels}
                />

                <ResultAdvice
                  advice={youAdvice}
                  expanded={youMore}
                  onToggle={() => setYouMore((value) => !value)}
                  readLess={t("readLess")}
                  readMore={t("readMore")}
                />

                {together ? (
                  <>
                    <ResultLayerStack
                      firmness={partnerCutout}
                      heading={t("partnerResult")}
                      labels={layerLabels}
                    />
                    <ResultAdvice
                      advice={partnerAdvice}
                      expanded={partnerMore}
                      onToggle={() => setPartnerMore((value) => !value)}
                      readLess={t("readLess")}
                      readMore={t("readMore")}
                    />
                  </>
                ) : null}

                <div className="mt-8 rounded-xl border border-brand-dark/10 px-4 pt-4 pb-6">
                  <p className="mb-3 font-bold text-base text-brand-dark">
                    {t("yourMattress")}
                  </p>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-base text-brand-dark">
                        {t("resultProduct")}
                      </p>
                      <p className="pt-0.5 text-base text-brand-dark/55">
                        {resultSize.label}
                        {resultQuantity > 1 ? ` × ${resultQuantity}` : ""}
                      </p>
                      <p className="pt-1 text-base text-brand-dark/55 leading-snug">
                        {tHero("variants.original.description")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <SalePrice
                        className="flex-col items-end gap-0.5"
                        compareCents={resultCompareCents}
                        saleCents={resultSaleCents}
                      />
                      {resultSaveCents > 0 ? (
                        <p className="mt-2">
                          <SaleBadge>
                            {t("saveAmount", {
                              amount: formatMattPrice(resultSaveCents),
                            })}
                          </SaleBadge>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="z-100 shrink-0 border-[#D9D9D9] border-t bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-0">
            <div
              className="relative -top-0.5 h-1 bg-brand transition-all duration-500 ease-in-out"
              style={{ width: `${20 * step}%` }}
            />
            <div className="flex items-center justify-between gap-3 px-5 py-3 lg:px-10 lg:py-4">
              <button
                className="flex min-w-0 items-center gap-2 py-2 text-brand text-sm disabled:opacity-40 lg:py-4"
                disabled={controlsLocked}
                onClick={handleBack}
                type="button"
              >
                <ChevronLeft className="size-4 shrink-0" />
                <span className="truncate">{backLabel}</span>
              </button>
              <button
                aria-busy={confirmLoading}
                className="inline-flex h-11 min-w-[140px] shrink-0 items-center justify-center rounded-full bg-brand px-6 text-base text-white transition-colors hover:bg-brand-dark disabled:opacity-40 sm:min-w-[167px] lg:h-12"
                disabled={step === 5 ? false : controlsLocked}
                onClick={step === 5 ? handleAddToCart : handleConfirm}
                type="button"
              >
                {confirmLoading ? (
                  <span
                    aria-hidden
                    className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  />
                ) : step === 5 ? (
                  t("addToBasket")
                ) : (
                  t("confirm")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative z-[100] min-h-0 w-full overflow-hidden lg:h-auto lg:min-h-full lg:w-[60%]",
          step === 5
            ? "h-[42vh] min-h-[42vh] flex-none lg:h-auto lg:min-h-full lg:flex-1"
            : "flex-1 lg:flex-grow",
        )}
        ref={visualPanelRef}
      >
        <ConfiguratorVideos
          bed={bed}
          clip={clip}
          label={t("videoAria")}
          onEnded={handleClipEnded}
          playbackRate={playbackRate}
          reducedMotion={reduceMotion}
        />

        <div
          className={cn(
            "absolute top-2 left-2 z-20 scale-90 duration-500 md:top-[35%] md:left-6 lg:top-[40%] lg:left-2 xl:left-10",
            showOverlay
              ? "visible translate-x-0 opacity-100 delay-500"
              : "invisible -translate-x-10 opacity-0",
          )}
        >
          <ConfiguratorFirmnessScale
            active={youCutout}
            dimmed={together && activeSleeper !== 1}
            labels={scale}
          />
        </div>

        <div
          className={cn(
            "absolute top-2 right-2 z-20 scale-90 duration-500 md:top-[35%] md:right-6 lg:top-[40%] lg:right-2 xl:right-10",
            showPartnerScale
              ? "visible translate-x-0 opacity-100 delay-500"
              : "invisible translate-x-10 opacity-0",
          )}
        >
          <ConfiguratorFirmnessScale
            active={partnerCutout}
            dimmed={activeSleeper !== 2}
            labels={scale}
            mirror
          />
        </div>

        {mindTheGap && showOverlay ? (
          <div className="absolute right-4 bottom-4 left-4 z-30 mx-auto max-w-md rounded-2xl bg-white p-4 text-brand-dark shadow-lg md:bottom-8">
            <p className="font-bold text-[20px]">{t("mindTheGapTitle")}</p>
            <p className="mt-2 text-sm leading-relaxed">
              {t("mindTheGapBody")}
            </p>
          </div>
        ) : null}
      </div>

      {sizeSheetOpen ? (
        <div className="absolute inset-0 z-[200] lg:hidden">
          <button
            aria-label={t("closeSize")}
            className="absolute inset-0 bg-brand-dark/20"
            onClick={() => setSizeSheetOpen(false)}
            type="button"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] min-h-[70dvh] flex-col gap-5 rounded-t-2xl bg-white p-6">
            <div className="flex items-center justify-between border-brand/20 border-b pb-5">
              <p className="font-bold font-heading text-[20px] text-brand-dark">
                {t("selectSize")}
              </p>
              <button
                aria-label={t("closeSize")}
                className="flex size-10 items-center justify-center rounded-full border border-brand-dark/15"
                onClick={() => setSizeSheetOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>
            <ConfiguratorCategoryToggle
              category={bed}
              doubleLabel={t("double")}
              onChange={handleCategory}
              singleLabel={t("single")}
            />
            <p className="text-brand-dark/70 text-sm">{t("sizeHint")}</p>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ConfiguratorSizeList
                onSelect={(id) => {
                  setSizeId(id);
                  setSizeSheetOpen(false);
                }}
                selectedId={sizeId}
                sizes={sizes}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SleepingOption({
  checked,
  disabled,
  label,
  name,
  onSelect,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  name: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4",
        checked ? "border-brand bg-brand-muted" : "border-grey",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        checked={checked}
        className="sr-only"
        name={name}
        onChange={onSelect}
        type="radio"
      />
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full border",
          checked ? "border-brand bg-brand" : "border-grey bg-white",
        )}
      >
        {checked ? <span className="size-2 rounded-full bg-white" /> : null}
      </span>
      <span className="font-medium text-brand-dark text-sm">{label}</span>
    </label>
  );
}

function ProfileFields({
  firmLabel,
  mediumLabel,
  onCommit,
  onPreference,
  onWeight,
  perfectFor,
  preference,
  prefix,
  softLabel,
  weight,
  weightSuffix,
}: {
  firmLabel: string;
  mediumLabel: string;
  onCommit: () => void;
  onPreference: (value: number) => void;
  onWeight: (value: number) => void;
  perfectFor: string;
  preference: number;
  prefix: string;
  softLabel: string;
  weight: number;
  weightSuffix: string;
}) {
  return (
    <>
      <ConfiguratorRangeField
        id={`${prefix}-weight`}
        label=""
        max={MAX_WEIGHT_KG}
        min={MIN_WEIGHT_KG}
        onCommit={onCommit}
        onValueChange={onWeight}
        suffix={weightSuffix}
        value={weight}
      />
      <ConfiguratorPreferenceField
        firmLabel={firmLabel}
        id={`${prefix}-preference`}
        mediumLabel={mediumLabel}
        onCommit={onCommit}
        onValueChange={onPreference}
        perfectFor={perfectFor}
        softLabel={softLabel}
        value={preference}
      />
    </>
  );
}

function ResultAdvice({
  advice,
  expanded,
  onToggle,
  readLess,
  readMore,
}: {
  advice?: Advice;
  expanded: boolean;
  onToggle: () => void;
  readLess: string;
  readMore: string;
}) {
  if (!advice) {
    return null;
  }

  return (
    <div className="mt-5">
      <p className="text-base text-brand-dark leading-relaxed lg:text-lg">
        {advice.text}
      </p>
      {expanded ? (
        <p className="mt-2 text-base text-brand-dark leading-relaxed lg:text-lg">
          {advice.more}
        </p>
      ) : null}
      <button
        className="mt-2 cursor-pointer font-medium text-base text-brand"
        onClick={onToggle}
        type="button"
      >
        {expanded ? readLess : readMore}
      </button>
    </div>
  );
}
