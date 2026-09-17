"use client";

import dynamic from "next/dynamic";

/**
 * Code-split the motion-heavy reviews carousel on PDP so it isn't in the
 * initial client bundle. SSR stays on for the section shell.
 * @see https://nextjs.org/docs/app/guides/lazy-loading
 */
const ReviewsCarouselDynamic = dynamic(
  () =>
    import("@/app/[locale]/reviews/sections/reviews-carousel-section").then(
      (mod) => ({ default: mod.ReviewsCarouselSection }),
    ),
  {
    loading: () => (
      <section
        aria-hidden
        className="min-h-[28rem] w-full bg-white py-14 md:py-20"
        id="reviews-list"
      />
    ),
  },
);

export function ReviewsCarouselLazy() {
  return <ReviewsCarouselDynamic />;
}
