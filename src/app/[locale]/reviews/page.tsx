import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReviewsSection } from "@/app/[locale]/(home)/sections/reviews-section";
import { ReviewsCarouselSection } from "@/app/[locale]/reviews/sections/reviews-carousel-section";
import { ReviewsHeroSection } from "@/app/[locale]/reviews/sections/reviews-hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "reviewsPage.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <SiteHeader theme="solid" />
      <main className="overflow-x-clip pt-16 lg:pt-20">
        <ReviewsHeroSection />
        <ReviewsSection ctaHref="#reviews-list" />
        <ReviewsCarouselSection />
      </main>
      <SiteFooter />
    </>
  );
}
