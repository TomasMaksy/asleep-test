import { setRequestLocale } from "next-intl/server";
import { ConfiguratorOverlaySync } from "@/components/configurator/configurator-overlay";
import type { Locale } from "@/i18n/routing";

export default async function InterceptedConfiguratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <ConfiguratorOverlaySync />;
}
