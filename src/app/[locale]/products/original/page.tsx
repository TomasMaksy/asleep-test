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
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("productOriginal.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function OriginalProductPage() {
  return (
    <>
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
