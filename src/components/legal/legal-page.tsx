import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { getLegalDocument, type LegalSlug } from "@/lib/legal-content";
import { buildPageMetadata } from "@/lib/seo-metadata";

export async function buildLegalMetadata({
  locale,
  slug,
  path,
}: {
  locale: string;
  slug: LegalSlug;
  path: `/${LegalSlug}`;
}): Promise<Metadata> {
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const document = await getLegalDocument(slug, locale);

  return {
    ...buildPageMetadata({
      locale,
      path,
      title: document.title,
      description: document.description,
    }),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export async function LegalPage({
  locale,
  slug,
}: {
  locale: string;
  slug: LegalSlug;
}) {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const document = await getLegalDocument(slug, locale);

  return (
    <>
      <SiteHeader theme="solid" />
      <main className="bg-white pt-16 lg:pt-20">
        <LegalDocumentView document={document} />
      </main>
      <SiteFooter />
    </>
  );
}
