import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutSection } from "@/app/[locale]/checkout/sections/checkout-section";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "checkoutPage.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CheckoutPage({
  params,
}: PageProps<"/[locale]/checkout">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <SiteHeader theme="solid" variant="minimal" />
      <main className="pt-16 lg:pt-20">
        <CheckoutSection />
      </main>
    </>
  );
}
