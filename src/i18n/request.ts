import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [
    shared,
    home,
    productOriginal,
    reviewsPage,
    contactPage,
    configuratorPage,
    checkoutPage,
  ] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/${locale}/home.json`),
    import(`../../messages/${locale}/product-original.json`),
    import(`../../messages/${locale}/reviews-page.json`),
    import(`../../messages/${locale}/contact.json`),
    import(`../../messages/${locale}/configurator.json`),
    import(`../../messages/${locale}/checkout.json`),
  ]);

  return {
    locale,
    messages: {
      ...shared.default,
      ...home.default,
      productOriginal: productOriginal.default,
      reviewsPage: reviewsPage.default,
      contactPage: contactPage.default,
      configuratorPage: configuratorPage.default,
      checkoutPage: checkoutPage.default,
    },
  };
});
