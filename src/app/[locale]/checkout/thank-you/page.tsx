import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutThanksSection } from "@/app/[locale]/checkout/sections/checkout-thanks";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout/thank-you">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "checkoutPage.thanks",
  });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CheckoutThankYouPage({
  params,
}: PageProps<"/[locale]/checkout/thank-you">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <SiteHeader theme="solid" variant="minimal" />
      <main className="pt-16 lg:pt-20">
        <CheckoutThanksSection />
      </main>
    </>
  );
}
