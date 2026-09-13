import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutThanksSection } from "@/app/[locale]/checkout/sections/checkout-thanks";
import { SiteHeader } from "@/components/site-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkoutPage.thanks");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CheckoutThankYouPage() {
  return (
    <>
      <SiteHeader theme="solid" variant="minimal" />
      <main className="pt-16 lg:pt-20">
        <CheckoutThanksSection />
      </main>
    </>
  );
}
