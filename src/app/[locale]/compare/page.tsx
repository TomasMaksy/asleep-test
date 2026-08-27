import { setRequestLocale } from "next-intl/server";
import { CompareView } from "@/app/[locale]/compare/compare-view";
import type { Locale } from "@/i18n/routing";

export default async function ComparePage({
  params,
}: PageProps<"/[locale]/compare">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <CompareView locale={locale as Locale} />;
}
