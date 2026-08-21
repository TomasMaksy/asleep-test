import Image from "next/image";
import { ReviewsZoom } from "@/components/effects/reviews-zoom";
import { Button } from "@/components/ui/button";
import { REVIEWS } from "@/lib/copy";

const SCALE_START = 1.8;

const SOURCE_LABEL = {
  asleep: "Asleep",
  google: "Google Reviews",
  consumentenbond: "Consumentenbond",
} as const;

type ReviewCardData = (typeof REVIEWS.cards)[number];

const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;

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

function SourceBadge({ source }: { source: ReviewCardData["source"] }) {
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

function ReviewCard({ card }: { card: ReviewCardData }) {
  return (
    <article
      className="absolute rounded-[24px] bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:p-5"
      style={{
        left: card.left,
        top: card.top,
        width: card.width,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Stars />
        <SourceBadge source={card.source} />
      </div>
      <p className="font-bold font-heading text-brand-dark text-sm leading-snug md:text-base">
        {card.quote}
      </p>
      <p className="mt-3 text-[#afafaf] text-xs md:text-sm">
        {SOURCE_LABEL[card.source]}
      </p>
    </article>
  );
}

export function ReviewsSection() {
  return (
    <ReviewsZoom>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[25%] bg-[linear-gradient(90deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:w-[20%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[12.5%] w-full bg-[linear-gradient(0deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:h-[30%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[12.5%] w-full bg-[linear-gradient(180deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:h-[30%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[25%] bg-[linear-gradient(-90deg,#f5f5f5_0%,rgba(245,245,245,0)_100%)] md:w-[20%]"
      />

      <div
        className="absolute inset-0 h-full w-full will-change-transform"
        data-reviews-wall=""
        style={{ transform: `scale(${SCALE_START})` }}
      >
        <div className="absolute inset-0 hidden md:block">
          {REVIEWS.cards.map((card) => (
            <ReviewCard card={card} key={`d-${card.quote}-${card.left}`} />
          ))}
        </div>
        <div className="absolute inset-0 md:hidden">
          {REVIEWS.cardsMobile.map((card) => (
            <ReviewCard card={card} key={`m-${card.quote}-${card.left}`} />
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 z-30 w-screen -translate-x-1/2 -translate-y-1/2 text-center md:w-fit">
        <p className="font-black font-heading text-[1.75rem] text-brand-dark leading-none tracking-[-0.08em] md:text-[5rem]">
          {REVIEWS.stat}
        </p>
        <p className="mt-3 text-brand-dark text-lg">{REVIEWS.caption}</p>
        <div className="mt-8 flex justify-center">
          <Button
            className="h-[49px] min-w-[144px]"
            href="#"
            variant="solid-brand"
          >
            {REVIEWS.cta}
          </Button>
        </div>
      </div>
    </ReviewsZoom>
  );
}
