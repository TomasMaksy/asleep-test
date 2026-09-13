import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ConfiguratorSection } from "@/app/[locale]/configurator/sections/configurator-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("configuratorPage.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ConfiguratorPage() {
  return (
    <main>
      <ConfiguratorSection />
    </main>
  );
}
