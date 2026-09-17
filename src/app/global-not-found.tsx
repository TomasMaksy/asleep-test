import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AsleepNavyFilter } from "@/components/asleep-navy-filter";
import { CartSheetHost } from "@/components/cart/cart-sheet-host";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import "./globals.css";

const outfit = localFont({
  src: "./fonts/Outfit-Variable.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--font-outfit",
  display: "swap",
});

async function resolveNotFoundLocale() {
  const headerLocale = (await headers()).get("x-next-intl-locale");
  if (hasLocale(routing.locales, headerLocale)) {
    return headerLocale;
  }

  return routing.defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveNotFoundLocale();
  setRequestLocale(locale);
  const t = await getTranslations("notFound");

  return {
    title: t("metaTitle"),
    description: t("body"),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function GlobalNotFound() {
  const locale = await resolveNotFoundLocale();
  setRequestLocale(locale);
  const t = await getTranslations("notFound");

  return (
    <html
      className={cn(outfit.variable, outfit.className, "h-full antialiased")}
      lang={locale}
    >
      <body className="relative font-sans text-brand-dark">
        <AsleepNavyFilter />
        <NextIntlClientProvider>
          <SiteHeader theme="solid" />
          <main className="flex min-h-dvh flex-col items-center justify-center px-6 pt-16 lg:pt-20">
            <p className="font-black text-6xl tracking-heading">{t("title")}</p>
            <p className="mt-4 text-base text-brand-dark/70">{t("body")}</p>
            <Link
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-white transition-colors hover:bg-brand-dark"
              href="/"
            >
              {t("cta")}
            </Link>
          </main>
          <SiteFooter />
          <CartSheetHost />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
