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
import { useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import {
  CONFIGURATOR_DEFAULT_SIZE_ID,
  configuratorCartVariant,
  DEFAULT_FIRMNESS,
  DEFAULT_PREFERENCE,
  DEFAULT_WEIGHT_KG,
  type Firmness,
  MAX_TRANSITION_QUEUE,
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  recommendFirmness,
  type Sleeping,
  suggestedSingleSizeId,
  VIDEO_PLAYBACK_RATE,
  VIDEO_PLAYBACK_RATE_FLUSH,
  VIDEO_PLAYBACK_RATE_QUEUED,
} from "@/lib/configurator";
import {
  DOUBLE_MATTRESS_SIZES,
  getMattressSize,
  isDoubleMattressSize,
  type MattressSizeId,
  SINGLE_MATTRESS_SIZES,
} from "@/lib/product-original-sizes";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

type QueuedTransition = {
  from: Firmness;
  to: Firmness;
};

type Advice = {
  text: string;
  more: string;
};

const DESKTOP_MQ = "(min-width: 1024px)";

type ConfiguratorSectionProps = {
  onDismiss?: () => void;
};

export function ConfiguratorSection({ onDismiss }: ConfiguratorSectionProps) {
  const t = useTranslations("configuratorPage");
  const productName = useTranslations("productOriginal.hero")("subtitle");
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const sizeFieldId = useId();

  const scale = t.raw("scale") as string[];
  const advice = t.raw("advice") as Advice[];

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
  const [you, setYou] = useState<Firmness>(DEFAULT_FIRMNESS);
  const [partner, setPartner] = useState<Firmness>(DEFAULT_FIRMNESS);
  const [mindTheGap, setMindTheGap] = useState(false);
  const [clip, setClip] = useState<ConfiguratorClip | null>(null);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(VIDEO_PLAYBACK_RATE);
  const [catchingUp, setCatchingUp] = useState(false);
  const [stageReady, setStageReady] = useState(false);
  const [sizeSheetOpen, setSizeSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSleeper, setActiveSleeper] = useState<1 | 2>(1);
  const [youMore, setYouMore] = useState(false);
  const [partnerMore, setPartnerMore] = useState(false);
  const [formHeight, setFormHeight] = useState<number>();
  const formInnerRef = useRef<HTMLDivElement>(null);

  const clipIdRef = useRef(0);
  const shownYouRef = useRef<Firmness>(DEFAULT_FIRMNESS);
  const queueRef = useRef<QueuedTransition[]>([]);
  const playingClipRef = useRef<ConfiguratorClip | null>(null);
  const pendingPackagingRef = useRef(false);
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

  const sizes =
    bed === "double" ? DOUBLE_MATTRESS_SIZES : SINGLE_MATTRESS_SIZES;

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

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

  function currentRecommendation() {
    return recommendFirmness({
      bed,
      sleeping,
      ...profileRef.current,
    });
  }

  function applyRecommendation() {
    const next = currentRecommendation();
    setYou(next.you);
    setPartner(next.partner);
    setMindTheGap(next.mindTheGap);
    return next;
  }

  function playIntro(afterStep: Step) {
    clipIdRef.current += 1;
    setIntroPlaying(true);
    const nextClip: ConfiguratorClip = {
      id: clipIdRef.current,
      kind: "intro",
      bed,
    };
    playingClipRef.current = nextClip;
    setClip(nextClip);
    applyRecommendation();
    setStep(afterStep);
  }

  function playIntroReverse(afterStep: Step) {
    clipIdRef.current += 1;
    setIntroPlaying(true);
    setStageReady(false);
    queueRef.current = [];
    setCatchingUp(false);
    const nextClip: ConfiguratorClip = {
      id: clipIdRef.current,
      kind: "intro",
      bed,
      reverse: true,
    };
    playingClipRef.current = nextClip;
    setClip(nextClip);
    setStep(afterStep);
  }

  function playTransition(from: Firmness, to: Firmness) {
    clipIdRef.current += 1;
    const nextClip: ConfiguratorClip = {
      id: clipIdRef.current,
      kind: "transition",
      bed,
      from,
      to,
    };
    playingClipRef.current = nextClip;
    setClip(nextClip);
  }

  function playPackaging() {
    const playing = playingClipRef.current;
    if (playing != null || queueRef.current.length > 0) {
      pendingPackagingRef.current = true;
      return;
    }

    startPackaging();
  }

  function startPackaging() {
    pendingPackagingRef.current = false;
    clipIdRef.current += 1;
    setCatchingUp(false);
    setPlaybackRate(1);
    const nextClip: ConfiguratorClip = {
      id: clipIdRef.current,
      kind: "packaging",
      bed,
    };
    playingClipRef.current = nextClip;
    setClip(nextClip);
  }

  function playHold(firmness: Firmness) {
    pendingPackagingRef.current = false;
    clipIdRef.current += 1;
    setPlaybackRate(VIDEO_PLAYBACK_RATE);
    const nextClip: ConfiguratorClip = {
      id: clipIdRef.current,
      kind: "hold",
      bed,
      firmness,
    };
    playingClipRef.current = nextClip;
    setClip(nextClip);
  }

  function chainEnd(): Firmness {
    const queued = queueRef.current;
    const lastQueued = queued[queued.length - 1];
    if (lastQueued) {
      return lastQueued.to;
    }
    const playing = playingClipRef.current;
    if (playing?.kind === "transition") {
      return playing.to;
    }
    return shownYouRef.current;
  }

  function enqueueFirmness(target: Firmness) {
    if (!stageReady) {
      return;
    }

    const playing = playingClipRef.current;
    const transitionPlaying = playing?.kind === "transition";

    if (!transitionPlaying && queueRef.current.length === 0) {
      if (shownYouRef.current === target) {
        return;
      }
      playTransition(shownYouRef.current, target);
      return;
    }

    const from = chainEnd();
    if (from === target) {
      return;
    }

    setPlaybackRate(VIDEO_PLAYBACK_RATE_QUEUED);

    const nextQueue = [...queueRef.current, { from, to: target }];
    if (nextQueue.length > MAX_TRANSITION_QUEUE) {
      const afterCurrent =
        playing?.kind === "transition" ? playing.to : shownYouRef.current;
      queueRef.current =
        afterCurrent === target ? [] : [{ from: afterCurrent, to: target }];
      setCatchingUp(true);
      setPlaybackRate(VIDEO_PLAYBACK_RATE_FLUSH);
      return;
    }

    queueRef.current = nextQueue;
  }

  function commitProfiles(sleeper: 1 | 2) {
    setActiveSleeper(sleeper);
    const next = applyRecommendation();
    enqueueFirmness(next.you);
  }

  function handleClipReady() {
    if (queueRef.current.length === 0) {
      setCatchingUp(false);
    }
  }

  function handleClipEnded(played: ConfiguratorClip) {
    playingClipRef.current = null;

    if (played.kind === "packaging" || played.kind === "hold") {
      setPlaybackRate(VIDEO_PLAYBACK_RATE);
      setCatchingUp(false);
      return;
    }

    if (played.kind === "intro") {
      setIntroPlaying(false);
      shownYouRef.current = DEFAULT_FIRMNESS;
      if (played.reverse) {
        setStageReady(false);
        queueRef.current = [];
        setPlaybackRate(VIDEO_PLAYBACK_RATE);
        setCatchingUp(false);
        return;
      }
      setStageReady(true);
      setActiveSleeper(1);
      const next = currentRecommendation();
      setYou(next.you);
      setPartner(next.partner);
      setMindTheGap(next.mindTheGap);
      if (next.you !== DEFAULT_FIRMNESS) {
        queueRef.current = [{ from: DEFAULT_FIRMNESS, to: next.you }];
      }
    } else {
      shownYouRef.current = played.to;
    }

    const queued = queueRef.current;
    const next = queued[0];
    if (next) {
      queueRef.current = queued.slice(1);
      if (queueRef.current.length > 0) {
        setPlaybackRate(VIDEO_PLAYBACK_RATE_QUEUED);
      }
      playTransition(next.from, next.to);
      return;
    }

    if (pendingPackagingRef.current) {
      startPackaging();
      return;
    }

    setPlaybackRate(VIDEO_PLAYBACK_RATE);
    setCatchingUp(false);
  }

  function handleCategory(category: "single" | "double") {
    if (category === "single" && bed !== "single") {
      setSizeId(SINGLE_MATTRESS_SIZES[0]?.id ?? CONFIGURATOR_DEFAULT_SIZE_ID);
      setSleeping("alone");
      pendingPackagingRef.current = false;
      playingClipRef.current = null;
      setClip(null);
      setStageReady(false);
    }
    if (category === "double" && bed !== "double") {
      setSizeId(DOUBLE_MATTRESS_SIZES[0]?.id ?? "140x200");
      pendingPackagingRef.current = false;
      playingClipRef.current = null;
      setClip(null);
      setStageReady(false);
    }
  }

  function handleConfirm() {
    if (introPlaying) {
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
  }

  function handleBack() {
    if (introPlaying) {
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
      playHold(shownYouRef.current);
      setStep(next);
      return;
    }
    setStep((current) => (current - 1) as Step);
  }

  function handleAddToCart() {
    const splitId = mindTheGap ? suggestedSingleSizeId(sizeId) : null;
    const cartSizeId = splitId ?? sizeId;
    const size = getMattressSize(cartSizeId);
    const youLabel = scale[you - 1] ?? "";
    const partnerLabel = scale[partner - 1] ?? "";

    addItem(
      {
        id: `matt-original-${cartSizeId}-c${you}${together ? `p${partner}` : ""}`,
        name: productName,
        price: size.originalCents / 100,
        image: "/images/product-original-hero-lifestyle.webp",
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
      },
      splitId ? 2 : 1,
    );
    openCart();
  }

  const youAdvice = advice[you - 1];
  const partnerAdvice = advice[partner - 1];
  const sizeLabel = getMattressSize(sizeId).label;
  const backLabel =
    step === 1 || step === 5 ? t("goBack") : t("previousQuestion");

  return (
    <section
      className={cn(
        "relative flex h-dvh flex-col-reverse overflow-x-hidden overflow-y-hidden bg-white lg:flex-row lg:justify-end",
        step === 5 && "h-auto min-h-dvh overflow-y-auto lg:h-dvh",
      )}
    >
      <div
        className={cn(
          "configurator-form-panel z-10 flex w-full min-w-0 shrink-0 flex-col overflow-hidden bg-white lg:h-auto lg:min-h-0 lg:w-[40%]",
          step === 5 && "h-auto",
        )}
        style={
          !isDesktop && step !== 5 && formHeight != null
            ? { height: formHeight }
            : undefined
        }
      >
        <div
          className="flex w-full min-w-0 flex-col lg:h-full"
          ref={formInnerRef}
        >
          <div
            className={cn(
              "min-w-0 p-5 lg:min-h-0 lg:flex-1 lg:p-0 lg:px-10 lg:pt-12 lg:pb-4",
              step === 1
                ? "pb-8 lg:flex lg:flex-col lg:overflow-hidden"
                : "pb-4",
              step !== 1 && "lg:overflow-y-auto",
            )}
          >
            {step === 1 ? (
              <>
                <div className="flex flex-col lg:hidden">
                  <h1 className="mb-3 font-bold font-heading text-[20px] text-brand-dark">
                    {t("sizeTitle")}
                  </h1>
                  <button
                    className="flex h-[52px] w-full items-center justify-between rounded-full border border-grey py-1 pr-5 pl-4 text-brand-dark"
                    disabled={introPlaying}
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
                    disabled={introPlaying}
                    label={t("alone")}
                    name={sizeFieldId}
                    onSelect={() => setSleeping("alone")}
                  />
                  <SleepingOption
                    checked={sleeping === "together"}
                    disabled={introPlaying}
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
              <div className="pb-8">
                <h2 className="mb-4 font-bold font-heading text-brand-dark text-xl lg:text-[32px]">
                  {t("resultTitle")}
                </h2>
                <p className="text-brand-dark text-sm leading-relaxed">
                  {together
                    ? mindTheGap
                      ? t("resultNoMatch")
                      : t("resultMatch")
                    : t("resultSolo")}
                </p>

                <ResultBlock
                  advice={youAdvice}
                  expanded={youMore}
                  heading={`${t("yourResult")}:`}
                  onToggle={() => setYouMore((value) => !value)}
                  readLess={t("readLess")}
                  readMore={t("readMore")}
                  summary={t("configuration", { number: you })}
                />

                {together ? (
                  <ResultBlock
                    advice={partnerAdvice}
                    expanded={partnerMore}
                    heading={`${t("partnerResult")}:`}
                    onToggle={() => setPartnerMore((value) => !value)}
                    readLess={t("readLess")}
                    readMore={t("readMore")}
                    summary={t("configuration", { number: partner })}
                  />
                ) : null}

                <button
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand font-normal text-base text-white transition-colors hover:bg-brand-dark"
                  onClick={handleAddToCart}
                  type="button"
                >
                  {t("addToBasket")}
                </button>
                <button
                  className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 text-brand text-sm"
                  onClick={handleBack}
                  type="button"
                >
                  <ChevronLeft className="size-4" />
                  {t("goBack")}
                </button>
              </div>
            ) : null}
          </div>

          {step !== 5 ? (
            <div className="z-100 shrink-0 border-[#D9D9D9] border-t bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-0">
              <div
                className="relative -top-0.5 h-1 bg-brand transition-all duration-500 ease-in-out"
                style={{ width: `${20 * step}%` }}
              />
              <div className="flex items-center justify-between gap-3 px-5 py-3 lg:px-10 lg:py-4">
                <button
                  className="flex min-w-0 items-center gap-2 py-2 text-brand text-sm disabled:opacity-50 lg:py-4"
                  disabled={introPlaying}
                  onClick={handleBack}
                  type="button"
                >
                  <ChevronLeft className="size-4 shrink-0" />
                  <span className="truncate">{backLabel}</span>
                </button>
                <button
                  className="inline-flex h-11 min-w-[140px] shrink-0 items-center justify-center rounded-full bg-brand px-6 text-base text-white transition-colors hover:bg-brand-dark disabled:opacity-50 sm:min-w-[167px] lg:h-12"
                  disabled={introPlaying}
                  onClick={handleConfirm}
                  type="button"
                >
                  {t("confirm")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "relative z-[100] min-h-0 w-full flex-1 overflow-hidden lg:h-auto lg:min-h-full lg:w-[60%] lg:flex-grow",
          step === 5 && "min-h-[42vh] lg:min-h-full",
        )}
      >
        <ConfiguratorVideos
          bed={bed}
          clip={clip}
          label={t("videoAria")}
          onEnded={handleClipEnded}
          onReady={handleClipReady}
          playbackRate={playbackRate}
          reducedMotion={reduceMotion}
        />

        <div
          aria-hidden={!catchingUp}
          aria-live="polite"
          className={cn(
            "absolute inset-0 z-[15] flex items-center justify-center bg-[#244f9c]/35 transition-opacity duration-300",
            catchingUp ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="w-[min(16rem,70%)] px-4">
            <div className="h-0.5 overflow-hidden rounded-full bg-white/25">
              <div className="configurator-catchup-bar h-full w-1/3 rounded-full bg-white" />
            </div>
            <p className="mt-3 text-center text-sm text-white/90">
              {t("updatingMattress")}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "absolute top-2 left-2 z-20 scale-90 duration-500 md:top-[35%] md:left-6 lg:top-[40%] lg:left-2 xl:left-10",
            showOverlay
              ? "visible translate-x-0 opacity-100 delay-500"
              : "invisible -translate-x-10 opacity-0",
          )}
        >
          <ConfiguratorFirmnessScale
            active={you}
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
            active={partner}
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

function ResultBlock({
  advice,
  expanded,
  heading,
  onToggle,
  readLess,
  readMore,
  summary,
}: {
  advice?: Advice;
  expanded: boolean;
  heading: string;
  onToggle: () => void;
  readLess: string;
  readMore: string;
  summary: string;
}) {
  if (!advice) {
    return null;
  }

  return (
    <div className="mt-6">
      <p>
        <span className="font-bold text-brand-dark">{heading} </span>
        <span className="text-brand-dark">{summary}</span>
      </p>
      <p className="mt-3 text-brand-dark text-sm leading-relaxed">
        {advice.text}
      </p>
      {expanded ? (
        <p className="mt-2 text-brand-dark text-sm leading-relaxed">
          {advice.more}
        </p>
      ) : null}
      <button
        className="mt-2 cursor-pointer font-medium text-brand text-sm"
        onClick={onToggle}
        type="button"
      >
        {expanded ? readLess : readMore}
      </button>
    </div>
  );
}
