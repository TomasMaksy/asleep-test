import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["lt", "en"],
  defaultLocale: "lt",
  localePrefix: "always",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
