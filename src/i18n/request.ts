import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [shared, home, productOriginal, reviewsPage] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/${locale}/home.json`),
    import(`../../messages/${locale}/product-original.json`),
    import(`../../messages/${locale}/reviews-page.json`),
  ]);

  return {
    locale,
    messages: {
      ...shared.default,
      ...home.default,
      productOriginal: productOriginal.default,
      reviewsPage: reviewsPage.default,
    },
  };
});
