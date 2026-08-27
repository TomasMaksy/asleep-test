import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const paths = [
  "/",
  "/compare",
  "/products/original",
  "/reviews",
  "/configurator",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${baseUrl}/${locale}${path === "/" ? "" : path}`,
      lastModified,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((altLocale) => [
            altLocale,
            `${baseUrl}/${altLocale}${path === "/" ? "" : path}`,
          ]),
        ),
      },
    })),
  );
}
