import type { Metadata } from "next";
import { buildLegalMetadata, LegalPage } from "@/components/legal/legal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLegalMetadata({ locale, slug: "privacy", path: "/privacy" });
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} slug="privacy" />;
}
