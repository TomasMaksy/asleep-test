import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import type { ReactNode } from "react";
import { AsleepNavyFilter } from "@/components/asleep-navy-filter";
import { CartSheetHost } from "@/components/cart/cart-sheet-host";
import { ConfiguratorShell } from "@/components/configurator/configurator-shell";
import { RevealObserver } from "@/components/reveal-observer";
import { type Locale, routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import "../globals.css";

const outfit = localFont({
  src: "../fonts/Outfit-Variable.ttf",
  weight: "100 900",
  style: "normal",
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
    title: {
      default: t("title"),
      template: "%s | asleep",
    },
    description: t("description"),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
  };
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: LayoutProps<"/[locale]"> & { modal: ReactNode }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);
  const messages = await getMessages();

  return (
    <html
      className={cn(outfit.variable, outfit.className, "h-full antialiased")}
      data-scroll-behavior="smooth"
      lang={locale}
    >
      <body className="relative min-h-full font-sans">
        <AsleepNavyFilter />
        <NextIntlClientProvider messages={messages}>
          <RevealObserver />
          <ConfiguratorShell overlay={modal}>{children}</ConfiguratorShell>
          <CartSheetHost />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
