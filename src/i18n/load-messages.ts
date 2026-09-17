import type { AbstractIntlMessages } from "next-intl";

type LocaleMessages = AbstractIntlMessages;

type MessageFile =
  | "shared"
  | "home"
  | "product-original"
  | "reviews-page"
  | "contact"
  | "configurator"
  | "checkout";

async function loadJson(locale: string, file: MessageFile) {
  switch (file) {
    case "shared":
      return (await import(`../../messages/${locale}.json`)).default;
    case "home":
      return (await import(`../../messages/${locale}/home.json`)).default;
    case "product-original":
      return (await import(`../../messages/${locale}/product-original.json`))
        .default;
    case "reviews-page":
      return (await import(`../../messages/${locale}/reviews-page.json`))
        .default;
    case "contact":
      return (await import(`../../messages/${locale}/contact.json`)).default;
    case "configurator":
      return (await import(`../../messages/${locale}/configurator.json`))
        .default;
    case "checkout":
      return (await import(`../../messages/${locale}/checkout.json`)).default;
  }
}

/**
 * Full next-intl catalog for a locale.
 *
 * We intentionally load every page namespace on every request (~50KB JSON).
 * Per-route splitting looked attractive but fights the App Router: the layout
 * `NextIntlClientProvider` does not remount on soft navigations, so page-scoped
 * catalogs caused intermittent MISSING_MESSAGE crashes in client components.
 * Legal Markdown stays outside this bundle (`content/legal/`).
 *
 * `pathname` is accepted for call-site compatibility; it does not filter.
 */
export async function loadMessagesForPath(
  locale: string,
  _pathname?: string | null,
): Promise<LocaleMessages> {
  const [
    shared,
    home,
    productOriginal,
    reviewsPage,
    contactPage,
    configurator,
    checkoutPage,
  ] = await Promise.all([
    loadJson(locale, "shared"),
    loadJson(locale, "home"),
    loadJson(locale, "product-original"),
    loadJson(locale, "reviews-page"),
    loadJson(locale, "contact"),
    loadJson(locale, "configurator"),
    loadJson(locale, "checkout"),
  ]);

  return {
    ...shared,
    ...home,
    productOriginal,
    reviewsPage,
    contactPage,
    configuratorPage: configurator,
    checkoutPage,
  };
}
