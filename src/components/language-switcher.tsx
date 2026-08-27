"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChevronIcon } from "@/components/icons";
import { LOCALE_CODE, LocaleFlag } from "@/components/locale-flag";
import { Link, usePathname } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const triggerBaseClassName =
  "flex h-10 cursor-pointer list-none items-center gap-2 rounded-full border px-3 font-medium text-sm duration-150 marker:content-none [&::-webkit-details-marker]:hidden";

export function LanguageSwitcher({
  solid = false,
  compactOnMobile = false,
}: {
  solid?: boolean;
  compactOnMobile?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("locale");
  const pathname = usePathname();

  const triggerClassName = cn(
    triggerBaseClassName,
    solid
      ? "border-brand-dark/25"
      : "border-white/30 group-hover:border-brand-dark/20 group-data-[scrolled=true]:border-brand-dark/20",
    compactOnMobile &&
      "size-10 justify-center gap-0 px-0 lg:h-10 lg:w-auto lg:justify-start lg:gap-2 lg:px-3",
  );

  const orderedLocales = [
    locale as Locale,
    ...routing.locales.filter((item) => item !== locale),
  ];

  return (
    <details className="group/lang relative">
      <summary aria-label={t(locale as Locale)} className={triggerClassName}>
        <LocaleFlag
          className={cn(compactOnMobile && "size-6 lg:size-5")}
          locale={locale as Locale}
        />
        <span
          className={cn(
            "uppercase tracking-wide",
            compactOnMobile && "hidden lg:inline",
          )}
        >
          {LOCALE_CODE[locale as Locale]}
        </span>
        <ChevronIcon
          className={cn(
            "opacity-80 transition-transform duration-200 group-open/lang:rotate-180",
            compactOnMobile && "hidden lg:block",
          )}
        />
      </summary>

      <div
        className={cn(
          "absolute top-[calc(100%+0.5rem)] right-0 z-50 min-w-[7.5rem] overflow-hidden rounded-2xl bg-white text-brand-dark shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
        )}
      >
        {orderedLocales.map((item, index) => {
          const isActive = item === locale;
          const isLast = index === orderedLocales.length - 1;

          const rowClassName = cn(
            "flex items-center gap-3 px-4 py-3 font-medium text-sm uppercase tracking-wide",
            !isLast && "border-brand-dark/10 border-b",
            isActive ? "text-brand-dark" : "text-brand-dark/40",
          );

          if (isActive) {
            return (
              <div className={rowClassName} key={item}>
                <LocaleFlag locale={item} />
                <span>{LOCALE_CODE[item]}</span>
              </div>
            );
          }

          return (
            <Link
              className={cn(
                rowClassName,
                "transition-colors duration-150 hover:bg-surface hover:text-brand-dark",
              )}
              href={pathname}
              key={item}
              locale={item}
              scroll={false}
            >
              <LocaleFlag locale={item} />
              <span>{LOCALE_CODE[item]}</span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}
