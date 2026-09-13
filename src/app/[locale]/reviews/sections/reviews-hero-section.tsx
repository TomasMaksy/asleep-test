import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ReviewShareButton } from "@/app/[locale]/reviews/review-share-button";

type RatingItem = {
  label: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
};

export async function ReviewsHeroSection() {
  const t = await getTranslations("reviewsPage.hero");
  const ratings = t.raw("ratings") as RatingItem[];

  return (
    <section className="bg-brand-dark px-5 pt-14 pb-16 text-white md:px-10 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mx-auto max-w-[16ch] font-black text-[2.75rem] leading-[1.08] tracking-heading md:max-w-[14ch] md:text-[5.25rem] md:leading-[0.98]">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-[36rem] text-base text-white/90 leading-7 md:text-lg md:leading-8">
          {t("body")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            className="inline-flex h-12 min-w-[168px] items-center justify-center rounded-full bg-white px-6 text-base text-brand-dark transition-colors hover:bg-white/90"
            href="#reviews-list"
          >
            {t("seeAll")}
          </a>
          <ReviewShareButton label={t("share")} />
        </div>

        <ul className="mt-14 flex flex-row items-start justify-center gap-10 sm:gap-16 md:gap-20">
          {ratings.map((item) => {
            const isAsleep = item.label.toLowerCase() === "asleep";
            return (
              <li className="flex flex-col items-center gap-4" key={item.label}>
                <p className="text-sm text-white md:text-base">{t("rating")}</p>
                <div className="flex h-8 w-full items-center justify-center md:h-9">
                  <Image
                    alt={item.label}
                    className={
                      isAsleep
                        ? "h-5 w-auto object-contain"
                        : "h-7 w-auto object-contain brightness-0 invert md:h-8"
                    }
                    height={item.logoHeight}
                    src={isAsleep ? "/images/logo/asleep-white.png" : item.logo}
                    width={item.logoWidth}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
