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

/** Copy selected top-level keys from a page JSON into the request messages. */
function assignKeys(
  target: LocaleMessages,
  source: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    if (key in source) {
      target[key] = source[key] as AbstractIntlMessages[string];
    }
  }
}

/**
 * Load only the message namespaces needed for `pathname`.
 * Shared chrome + configurator (site-wide overlay) always load.
 * Legal body copy lives in `content/legal/` and is never part of this bundle.
 *
 * When a route reuses a section from another page, list that dependency here
 * (prefer picking keys over merging a whole page file).
 */
export async function loadMessagesForPath(
  locale: string,
  pathname: string | null,
): Promise<LocaleMessages> {
  const shared = await loadJson(locale, "shared");
  const configurator = await loadJson(locale, "configurator");

  const messages: LocaleMessages = {
    ...shared,
    configuratorPage: configurator,
  };

  // No pathname (build / edge cases): keep previous “load everything” behaviour.
  if (!pathname) {
    const [home, productOriginal, reviewsPage, contactPage, checkoutPage] =
      await Promise.all([
        loadJson(locale, "home"),
        loadJson(locale, "product-original"),
        loadJson(locale, "reviews-page"),
        loadJson(locale, "contact"),
        loadJson(locale, "checkout"),
      ]);

    return {
      ...messages,
      ...home,
      productOriginal,
      reviewsPage,
      contactPage,
      checkoutPage,
    };
  }

  const path = pathname === "" ? "/" : pathname;

  if (path === "/") {
    // Home reuses ProductLayersSection from the PDP.
    const [home, productOriginal] = await Promise.all([
      loadJson(locale, "home"),
      loadJson(locale, "product-original"),
    ]);
    Object.assign(messages, home);
    messages.productOriginal = productOriginal;
    return messages;
  }

  if (path.startsWith("/products/original")) {
    // PDP reuses SupportSection (home) + ReviewsCarouselSection (reviews page).
    const [productOriginal, home, reviewsPage] = await Promise.all([
      loadJson(locale, "product-original"),
      loadJson(locale, "home"),
      loadJson(locale, "reviews-page"),
    ]);
    messages.productOriginal = productOriginal;
    messages.reviewsPage = reviewsPage;
    assignKeys(messages, home as Record<string, unknown>, ["support"]);
    return messages;
  }

  if (path.startsWith("/configurator")) {
    // Result step reuses product name / sale copy from the PDP hero.
    messages.productOriginal = await loadJson(locale, "product-original");
    return messages;
  }

  if (path.startsWith("/reviews")) {
    // Reviews page reuses floating ReviewsSection cards from home.
    const [reviewsPage, home] = await Promise.all([
      loadJson(locale, "reviews-page"),
      loadJson(locale, "home"),
    ]);
    messages.reviewsPage = reviewsPage;
    assignKeys(messages, home as Record<string, unknown>, ["reviews"]);
    return messages;
  }

  if (path.startsWith("/contact")) {
    // Contact FAQ reuses product specs copy today.
    const [contactPage, productOriginal] = await Promise.all([
      loadJson(locale, "contact"),
      loadJson(locale, "product-original"),
    ]);
    messages.contactPage = contactPage;
    messages.productOriginal = productOriginal;
    return messages;
  }

  if (path.startsWith("/checkout")) {
    messages.checkoutPage = await loadJson(locale, "checkout");
    return messages;
  }

  // Legal and other light routes: shared + configurator only.
  return messages;
}
