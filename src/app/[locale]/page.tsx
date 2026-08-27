import { setRequestLocale } from "next-intl/server";
import { BedroomSection } from "@/app/[locale]/(home)/sections/bedroom-section";
import { BundlesSection } from "@/app/[locale]/(home)/sections/bundles-section";
import { HeroSection } from "@/app/[locale]/(home)/sections/hero-section";
import { ProductsSection } from "@/app/[locale]/(home)/sections/products-section";
import { PromiseSection } from "@/app/[locale]/(home)/sections/promise-section";
import { ReviewsSection } from "@/app/[locale]/(home)/sections/reviews-section";
import { SupportSection } from "@/app/[locale]/(home)/sections/support-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

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
        <SupportSection />
      </main>
      <SiteFooter />
    </>
  );
}
