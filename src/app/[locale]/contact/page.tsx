import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactHashScroll } from "@/app/[locale]/contact/contact-hash-scroll";
import { ContactFaqSection } from "@/app/[locale]/contact/sections/contact-faq-section";
import { ContactHeroSection } from "@/app/[locale]/contact/sections/contact-hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildPageMetadata } from "@/lib/seo-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("contactPage.metadata");

  return buildPageMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("description"),
  });
}

export default function ContactPage() {
  return (
    <>
      <SiteHeader theme="solid" />
      <main className="pt-16 lg:pt-20">
        <ContactHashScroll />
        <ContactHeroSection />
        <ContactFaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
