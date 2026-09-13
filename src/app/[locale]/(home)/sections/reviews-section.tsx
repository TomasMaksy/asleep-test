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
const DESKTOP_SPREAD_X = 0.88;
const DESKTOP_SPREAD_Y = 0.9;
const TABLET_SPREAD_X = 1.1;
const TABLET_SPREAD_Y = 1.05;
const MOBILE_SPREAD_X = 1.42;
const MOBILE_SPREAD_Y = 1.14;
const MOBILE_CARD_COUNT = 6;
const TYPICAL_CARD_HEIGHT = 16;

function parsePercent(value: string) {
  return Number.parseFloat(value);
}

/** Place a card by its original center. Width is a fixed rem, not a % of the viewport. */
function layoutCard(
  card: ReviewCardData,
  spreadX = 1,
  spreadY = 1,
): ReviewCardData {
  const centerX = parsePercent(card.left) + parsePercent(card.width) / 2;
  const centerY = parsePercent(card.top) + TYPICAL_CARD_HEIGHT / 2;

  return {
    ...card,
    left: `${(50 + (centerX - 50) * spreadX).toFixed(2)}%`,
    top: `${(50 + (centerY - 50) * spreadY).toFixed(2)}%`,
  };
}

function Stars({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className="flex gap-0.5">
      {STAR_KEYS.map((key) => (
        <svg
          aria-hidden="true"
          className={cn("fill-[#f9ce23]", compact ? "size-3" : "size-4")}
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

function SourceBadge({
  compact = false,
  source,
}: {
  compact?: boolean;
  source: ReviewSource;
}) {
  if (source === "asleep") {
    return (
      <Image
        alt=""
        className={cn("w-auto object-contain", compact ? "h-3" : "h-4")}
        height={417}
        src="/images/logo/asleep-black.png"
        width={1304}
      />
    );
  }

  return (
    <Image
      alt=""
      className={cn("object-contain", compact ? "size-4" : "size-6")}
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
  compact = false,
  sourceLabels,
}: {
  card: ReviewCardData;
  compact?: boolean;
  sourceLabels: SourceLabels;
}) {
  return (
    <article
      className={cn(
        "absolute origin-center -translate-x-1/2 -translate-y-1/2 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)]",
        compact ? "w-42 rounded-2xl p-2.5" : "w-72 rounded-3xl p-4",
      )}
      style={{
        left: card.left,
        top: card.top,
      }}
    >
      <div
        className={cn(
          "flex items-start justify-between gap-2",
          compact ? "mb-1.5" : "mb-2.5",
        )}
      >
        <Stars compact={compact} />
        <SourceBadge compact={compact} source={card.source} />
      </div>
      <p
        className={cn(
          "font-bold font-heading text-brand-dark leading-snug",
          compact ? "text-sm" : "text-lg",
        )}
      >
        {card.quote}
      </p>
      <p
        className={cn(
          "text-[#afafaf]",
          compact ? "mt-1.5 text-[11px]" : "mt-2.5 text-sm",
        )}
      >
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
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[10%] bg-[linear-gradient(90deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:w-[20%]"
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
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[10%] bg-[linear-gradient(-90deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:w-[20%]"
      />

      <div
        className="absolute inset-0 h-full w-full origin-center will-change-transform max-md:scale-[1.42] md:max-xl:scale-[1.2] xl:scale-[1.5]"
        data-reviews-wall=""
      >
        <div className="absolute inset-0 hidden xl:block">
          {cards.map((card) => (
            <ReviewCard
              card={layoutCard(card, DESKTOP_SPREAD_X, DESKTOP_SPREAD_Y)}
              key={`d-${card.quote}-${card.left}`}
              sourceLabels={sourceLabels}
            />
          ))}
        </div>
        <div className="absolute inset-0 hidden md:block xl:hidden">
          {cards.map((card) => (
            <ReviewCard
              card={layoutCard(card, TABLET_SPREAD_X, TABLET_SPREAD_Y)}
              key={`t-${card.quote}-${card.left}`}
              sourceLabels={sourceLabels}
            />
          ))}
        </div>
        <div className="absolute inset-0 md:hidden">
          {cardsMobile.slice(0, MOBILE_CARD_COUNT).map((card) => (
            <ReviewCard
              card={layoutCard(card, MOBILE_SPREAD_X, MOBILE_SPREAD_Y)}
              compact
              key={`m-${card.quote}-${card.left}`}
              sourceLabels={sourceLabels}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 z-30 w-screen -translate-x-1/2 -translate-y-1/2 text-center md:w-fit">
        <p className="font-black font-heading text-[3rem] text-brand-dark leading-none tracking-[-0.04em] md:text-[5rem]">
          {t("stat")}
        </p>
        <p className="mt-2 text-base text-brand-dark md:mt-3 md:text-lg">
          {t("caption")}
        </p>
        <div className="mt-6 flex justify-center md:mt-8">
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
