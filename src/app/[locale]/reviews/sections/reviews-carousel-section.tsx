import { getTranslations } from "next-intl/server";
import {
  type ReviewsCarouselCopy,
  type ReviewsCarouselItem,
} from "@/app/[locale]/reviews/sections/reviews-carousel";
import { ReviewsCarouselLazy } from "@/app/[locale]/reviews/sections/reviews-carousel-lazy";

/** Server wrapper: resolve copy here so the client carousel never hits useTranslations. */
export async function ReviewsCarouselSection() {
  const t = await getTranslations("reviewsPage.carousel");
  const copy: ReviewsCarouselCopy = {
    items: t.raw("items") as ReviewsCarouselItem[],
    prev: t("prev"),
    next: t("next"),
  };

  return <ReviewsCarouselLazy copy={copy} />;
}
