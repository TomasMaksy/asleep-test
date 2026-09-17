import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ConfiguratorSection } from "@/app/[locale]/configurator/sections/configurator-section";
import { buildPageMetadata } from "@/lib/seo-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("configuratorPage.metadata");

  return buildPageMetadata({
    locale,
    path: "/configurator",
    title: t("title"),
    description: t("description"),
  });
}

export default function ConfiguratorPage() {
  return (
    <main>
      <ConfiguratorSection />
    </main>
  );
}
