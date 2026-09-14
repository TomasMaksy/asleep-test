import { HeroSection } from "@/app/[locale]/(home)/sections/hero-section";
import { ProductsSection } from "@/app/[locale]/(home)/sections/products-section";
import { PromiseSection } from "@/app/[locale]/(home)/sections/promise-section";
import { ReviewsSection } from "@/app/[locale]/(home)/sections/reviews-section";
import { SupportSection } from "@/app/[locale]/(home)/sections/support-section";
import { ProductLayersSection } from "@/app/[locale]/products/original/sections/product-layers-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProductsSection />
        <ProductLayersSection className="bg-highlight-default" />
        <PromiseSection />
        <ReviewsSection />
        <SupportSection />
      </main>
      <SiteFooter />
    </>
  );
}
