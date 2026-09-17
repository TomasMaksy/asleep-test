import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReviewsSection } from "@/app/[locale]/(home)/sections/reviews-section";
import { ReviewsCarouselSection } from "@/app/[locale]/reviews/sections/reviews-carousel-section";
import { ReviewsHeroSection } from "@/app/[locale]/reviews/sections/reviews-hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildPageMetadata } from "@/lib/seo-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("reviewsPage.metadata");

  return buildPageMetadata({
    locale,
    path: "/reviews",
    title: t("title"),
    description: t("description"),
  });
}

export default function ReviewsPage() {
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
