import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/seo-metadata";
import { getSiteUrl } from "@/lib/site-url";

/** Public, indexable routes only — never internal tools like /compare. */
const paths = [
  "/",
  "/products/original",
  "/reviews",
  "/configurator",
  "/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  return paths.flatMap((path) => {
    const languages = Object.fromEntries([
      ...routing.locales.map((locale) => [
        locale,
        `${baseUrl}${localePath(locale, path)}`,
      ]),
      ["x-default", `${baseUrl}${localePath(routing.defaultLocale, path)}`],
    ]);

    return routing.locales.map((locale) => ({
      url: `${baseUrl}${localePath(locale, path)}`,
      alternates: { languages },
    }));
  });
}
