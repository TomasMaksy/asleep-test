import { getTranslations } from "next-intl/server";
import { ProductBuyBox } from "@/app/[locale]/products/original/product-buy-box";
import { ProductMediaGallery } from "@/app/[locale]/products/original/product-media-gallery";
import { ProductPurchaseExtras } from "@/app/[locale]/products/original/sections/product-purchase-extras";

function ProductHeroRating({
  rating,
  seeReviews,
}: {
  rating: string;
  seeReviews: string;
}) {
  return (
    <a
      className="mb-4 flex w-fit cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5"
      href="#reviews-list"
    >
      <span aria-hidden="true" className="flex items-center gap-0.5">
        <StarIcon />
        <StarIcon />
        <StarIcon />
        <StarIcon />
        <StarIcon half />
      </span>
      <span className="text-base text-brand leading-7">{rating}</span>
      <span className="text-base text-brand leading-7">{seeReviews}</span>
    </a>
  );
}

function StarIcon({ half }: { half?: boolean }) {
  if (half) {
    return (
      <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20">
        <defs>
          <linearGradient id="product-half-star">
            <stop offset="50%" stopColor="#f9ce23" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"
          fill="url(#product-half-star)"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-5 fill-[#f9ce23]"
      viewBox="0 0 20 20"
    >
      <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
    </svg>
  );
}

export async function ProductHeroSection() {
  const t = await getTranslations("productOriginal.hero");

  return (
    <section className="border-[#ececec] border-b bg-white">
      <div className="relative flex flex-col bg-white 2xl:container lg:flex-row 2xl:mx-auto">
        <div className="relative hidden w-full pb-3 lg:block lg:w-[55%]">
          <ProductMediaGallery awardAlt="Consumentenbond 13-time winner" />
        </div>

        <div className="w-full lg:w-[45%] lg:px-0 lg:py-10 lg:pl-12 xl:pr-20 xl:pl-16 2xl:px-0 2xl:pt-12 2xl:pl-24">
          <div className="mx-auto w-full 2xl:max-w-[960px]">
            <div className="mb-6 lg:hidden">
              <ProductMediaGallery awardAlt="Consumentenbond 13-time winner" />
            </div>

            <div className="flex flex-col px-5 lg:px-0">
              <h1
                className="font-black text-[28px] text-brand-dark leading-[36px] tracking-heading"
                id="product-hero-title"
              >
                {t("title")}
              </h1>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-[20px] text-brand-dark leading-[20px]">
                  {t("subtitle")}
                </p>
              </div>
              <ProductHeroRating
                rating={t("rating")}
                seeReviews={t("seeReviews")}
              />
            </div>

            <div className="px-5 lg:px-0">
              <ProductBuyBox />
              <ProductPurchaseExtras />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
