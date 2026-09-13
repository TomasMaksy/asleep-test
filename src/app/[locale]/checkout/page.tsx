import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutSection } from "@/app/[locale]/checkout/sections/checkout-section";
import { SiteHeader } from "@/components/site-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkoutPage.metadata");

  return {
    title: t("title"),
    description: t("description"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader theme="solid" variant="minimal" />
      <main className="pt-16 lg:pt-20">
        <CheckoutSection />
      </main>
    </>
  );
}
