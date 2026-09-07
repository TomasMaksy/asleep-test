import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactHashScroll } from "@/app/[locale]/contact/contact-hash-scroll";
import { ContactFaqSection } from "@/app/[locale]/contact/sections/contact-faq-section";
import { ContactHeroSection } from "@/app/[locale]/contact/sections/contact-hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "contactPage.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

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
