import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SupportSection } from "@/app/[locale]/(home)/sections/support-section";
import { ProductConfiguratorSection } from "@/app/[locale]/products/original/sections/product-configurator-section";
import { ProductDifferenceSection } from "@/app/[locale]/products/original/sections/product-difference-section";
import { ProductHeroSection } from "@/app/[locale]/products/original/sections/product-hero-section";
import { ProductInfoSliderSection } from "@/app/[locale]/products/original/sections/product-info-slider-section";
import { ProductLayersSection } from "@/app/[locale]/products/original/sections/product-layers-section";
import { ProductSpecsSection } from "@/app/[locale]/products/original/sections/product-specs-section";
import { ReviewsCarouselSection } from "@/app/[locale]/reviews/sections/reviews-carousel-section";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const PRODUCT_PATH = "/products/original";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("productOriginal.metadata");
  const baseUrl = getSiteUrl();
  const languages: Record<string, string> = {};

  for (const altLocale of routing.locales) {
    languages[altLocale] = `${baseUrl}/${altLocale}${PRODUCT_PATH}`;
  }
  languages["x-default"] = `${baseUrl}/${routing.defaultLocale}${PRODUCT_PATH}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${baseUrl}/${locale}${PRODUCT_PATH}`,
      languages,
    },
  };
}

export default function OriginalProductPage() {
  return (
    <>
      <ProductJsonLd />
      <SiteHeader theme="solid" />
      <main className="pt-16 lg:pt-20">
        <ProductHeroSection />
        <ProductInfoSliderSection />
        <ProductConfiguratorSection />
        <ProductLayersSection />
        <ProductDifferenceSection />
        <ProductSpecsSection />
        <ReviewsCarouselSection />
        <SupportSection />
      </main>
      <SiteFooter />
    </>
  );
}
