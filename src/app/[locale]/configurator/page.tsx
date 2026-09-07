import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ConfiguratorSection } from "@/app/[locale]/configurator/sections/configurator-section";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/configurator">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "configuratorPage.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ConfiguratorPage({
  params,
}: PageProps<"/[locale]/configurator">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <main>
      <ConfiguratorSection />
    </main>
  );
}
