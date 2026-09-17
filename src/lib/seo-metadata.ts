import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const OG_IMAGE = {
  url: "/images/seo/og-default.webp",
  width: 1200,
  height: 630,
  alt: "asleep",
} as const;

/**
 * Public path for a locale under `localePrefix: "as-needed"`.
 * Default locale (lt) is unprefixed; others get `/${locale}…`.
 * Pass "" or "/" for home. No trailing slash.
 */
export function localePath(locale: string, path = "") {
  const normalized =
    !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized;
  }
  return `/${locale}${normalized}`;
}

/** Canonical + hreflang (+ default OG/Twitter) for a public marketing page. */
export function buildPageMetadata({
  locale,
  path = "",
  title,
  description,
  ogAlt,
}: {
  locale: string;
  path?: string;
  title: string;
  description: string;
  ogAlt?: string;
}): Metadata {
  const baseUrl = getSiteUrl();
  const pageUrl = `${baseUrl}${localePath(locale, path)}`;
  const languages: Record<string, string> = {};

  for (const altLocale of routing.locales) {
    languages[altLocale] = `${baseUrl}${localePath(altLocale, path)}`;
  }
  languages["x-default"] =
    `${baseUrl}${localePath(routing.defaultLocale, path)}`;

  const image = {
    ...OG_IMAGE,
    alt: ogAlt ?? OG_IMAGE.alt,
  };

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "lt" ? "lt_LT" : "en_US",
      url: pageUrl,
      siteName: "asleep",
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
