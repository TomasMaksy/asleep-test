import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["lt", "en"],
  defaultLocale: "lt",
  localePrefix: "as-needed",
  localeDetection: false,
  // HTML metadata + sitemap own hreflang; avoid a competing Link header.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
