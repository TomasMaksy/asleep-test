import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { loadMessagesForPath } from "@/i18n/load-messages";
import { routing } from "@/i18n/routing";
import { getRequestPathname } from "@/lib/request-pathname";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  if (!hasLocale(routing.locales, locale)) {
    const fromRequest = await requestLocale;
    if (hasLocale(routing.locales, fromRequest)) {
      locale = fromRequest;
    } else {
      let paramValue: string | undefined;
      try {
        paramValue = await rootParams.locale();
      } catch {
        paramValue = undefined;
      }

      if (hasLocale(routing.locales, paramValue)) {
        locale = paramValue;
      } else {
        notFound();
      }
    }
  }

  const pathname = await getRequestPathname();
  const messages = await loadMessagesForPath(locale, pathname);

  return {
    locale,
    messages,
  };
});
