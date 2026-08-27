import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { CartSheetHost } from "@/components/cart/cart-sheet-host";
import { RevealObserver } from "@/components/reveal-observer";
import { type Locale, routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "metadata" });
  const baseUrl = getSiteUrl();
  const languages: Record<string, string> = {};

  for (const altLocale of routing.locales) {
    languages[altLocale] = `${baseUrl}/${altLocale}`;
  }
  languages["x-default"] = `${baseUrl}/${routing.defaultLocale}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);
  const messages = await getMessages();

  return (
    <html className={cn(outfit.variable, "h-full antialiased")} lang={locale}>
      <body className="relative min-h-full font-sans">
        <NextIntlClientProvider messages={messages}>
          <RevealObserver />
          {children}
          <CartSheetHost />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
