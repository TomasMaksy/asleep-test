import { BedroomSection } from "@/app/(home)/sections/bedroom-section";
import { BundlesSection } from "@/app/(home)/sections/bundles-section";
import { HeroSection } from "@/app/(home)/sections/hero-section";
import { MediaSection } from "@/app/(home)/sections/media-section";
import { ProductsSection } from "@/app/(home)/sections/products-section";
import { PromiseSection } from "@/app/(home)/sections/promise-section";
import { ReviewsSection } from "@/app/(home)/sections/reviews-section";
import { SupportSection } from "@/app/(home)/sections/support-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProductsSection />
        <BundlesSection />
        <ReviewsSection />
        <BedroomSection />
        <PromiseSection />
        <MediaSection />
        <SupportSection />
      </main>
      <SiteFooter />
    </>
  );
}
