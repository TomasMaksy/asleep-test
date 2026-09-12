import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ReviewsZoom } from "@/components/effects/reviews-zoom";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ReviewSource = "asleep" | "google" | "consumentenbond";

type ReviewCardData = {
  quote: string;
  source: ReviewSource;
  left: string;
  top: string;
  width: string;
};

type SourceLabels = Record<ReviewSource, string>;

const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;
const CARD_SIZE = 0.75;
const CARD_SIZE_MOBILE = 0.58;
const DESKTOP_SPREAD_X = 0.88;
const DESKTOP_SPREAD_Y = 0.9;
const MOBILE_SPREAD_X = 1.14;
const MOBILE_SPREAD_Y = 1.06;
const TYPICAL_CARD_HEIGHT = 16;

function parsePercent(value: string) {
  return Number.parseFloat(value);
}

/** Shrink a card around its center so more quotes fit on screen with room to fly in. */
function layoutCard(
  card: ReviewCardData,
  size: number,
  spreadX = 1,
  spreadY = 1,
): ReviewCardData {
  const left = parsePercent(card.left);
  const top = parsePercent(card.top);
  const width = parsePercent(card.width);
  const nextWidth = width * size;
  const centerX = left + width / 2;
  const centerY = top + TYPICAL_CARD_HEIGHT / 2;
  let nextLeft = centerX - nextWidth / 2;
  let nextTop = centerY - (TYPICAL_CARD_HEIGHT * size) / 2;

  if (spreadX !== 1 || spreadY !== 1) {
    const laidOutCenterX = nextLeft + nextWidth / 2;
    nextLeft = 50 + (laidOutCenterX - 50) * spreadX - nextWidth / 2;
    nextTop = 50 + (nextTop - 50) * spreadY;
  }

  return {
    ...card,
    left: `${nextLeft.toFixed(2)}%`,
    top: `${nextTop.toFixed(2)}%`,
    width: `${nextWidth.toFixed(2)}%`,
  };
}

function Stars() {
  return (
    <div aria-hidden="true" className="flex gap-0.5">
      {STAR_KEYS.map((key) => (
        <svg
          aria-hidden="true"
          className="size-3.5 fill-[#f9ce23] md:size-4"
          focusable="false"
          key={key}
          viewBox="0 0 20 20"
        >
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: ReviewSource }) {
  if (source === "asleep") {
    return (
      <Image
        alt=""
        className="h-3.5 w-auto object-contain md:h-4"
        height={417}
        src="/images/logo/asleep-black.png"
        width={1304}
      />
    );
  }

  return (
    <Image
      alt=""
      className="size-5 object-contain md:size-6"
      height={source === "google" ? 512 : 225}
      src={
        source === "google"
          ? "/images/reviews/google.png"
          : "/images/reviews/consumentenbond.jpg"
      }
      width={source === "google" ? 512 : 225}
    />
  );
}

function ReviewCard({
  card,
  sourceLabels,
}: {
  card: ReviewCardData;
  sourceLabels: SourceLabels;
}) {
  return (
    <article
      className="absolute origin-center rounded-[20px] bg-white p-3.5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:rounded-3xl md:p-4"
      style={{
        left: card.left,
        top: card.top,
        width: card.width,
      }}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <Stars />
        <SourceBadge source={card.source} />
      </div>
      <p className="font-bold font-heading text-base text-brand-dark leading-snug md:text-lg">
        {card.quote}
      </p>
      <p className="mt-2.5 text-[#afafaf] text-xs md:text-sm">
        {sourceLabels[card.source]}
      </p>
    </article>
  );
}

export async function ReviewsSection({
  ctaHref = "/reviews",
}: {
  ctaHref?: "/reviews" | "#reviews-list";
}) {
  const t = await getTranslations("reviews");
  const cards = t.raw("cards") as ReviewCardData[];
  const cardsMobile = t.raw("cardsMobile") as ReviewCardData[];
  const sourceLabels = t.raw("sources") as SourceLabels;
  const ctaClassName = cn(
    "inline-flex h-[49px] min-w-[144px] items-center justify-center rounded-full px-6 py-3 text-center font-sans text-base tracking-normal transition-colors duration-300",
    "bg-[#1A478A] text-white hover:bg-[#2B2D41]",
  );

  return (
    <ReviewsZoom>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[16%] bg-[linear-gradient(90deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:w-[20%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[10%] w-full bg-[linear-gradient(0deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:h-[30%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[10%] w-full bg-[linear-gradient(180deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:h-[30%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[16%] bg-[linear-gradient(-90deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:w-[20%]"
      />

      <div
        className="absolute inset-0 h-full w-full origin-center will-change-transform max-md:scale-[1.28] md:scale-[1.5]"
        data-reviews-wall=""
      >
        <div className="absolute inset-0 hidden md:block">
          {cards.map((card) => (
            <ReviewCard
              card={layoutCard(
                card,
                CARD_SIZE,
                DESKTOP_SPREAD_X,
                DESKTOP_SPREAD_Y,
              )}
              key={`d-${card.quote}-${card.left}`}
              sourceLabels={sourceLabels}
            />
          ))}
        </div>
        <div className="absolute inset-0 md:hidden">
          {cardsMobile.map((card) => (
            <ReviewCard
              card={layoutCard(
                card,
                CARD_SIZE_MOBILE,
                MOBILE_SPREAD_X,
                MOBILE_SPREAD_Y,
              )}
              key={`m-${card.quote}-${card.left}`}
              sourceLabels={sourceLabels}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 z-30 w-screen -translate-x-1/2 -translate-y-1/2 text-center md:w-fit">
        <p className="font-black font-heading text-[1.75rem] text-brand-dark leading-none tracking-[-0.04em] md:text-[5rem]">
          {t("stat")}
        </p>
        <p className="mt-3 text-brand-dark text-lg">{t("caption")}</p>
        <div className="mt-8 flex justify-center">
          {ctaHref.startsWith("#") ? (
            <a className={ctaClassName} href={ctaHref}>
              {t("cta")}
            </a>
          ) : (
            <Link className={ctaClassName} href={ctaHref}>
              {t("cta")}
            </Link>
          )}
        </div>
      </div>
    </ReviewsZoom>
  );
}
