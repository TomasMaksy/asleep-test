import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LocaleFlagProps = {
  locale: Locale;
  className?: string;
};

export function LocaleFlag({ locale, className }: LocaleFlagProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex size-5 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      {locale === "lt" ? <LithuaniaFlag /> : <UnitedKingdomFlag />}
    </span>
  );
}

export const LOCALE_CODE: Record<Locale, string> = {
  lt: "LT",
  en: "EN",
};

function LithuaniaFlag() {
  return (
    <svg
      aria-hidden="true"
      className="size-full"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#FDB913" height="8" width="24" y="0" />
      <rect fill="#006A44" height="8" width="24" y="8" />
      <rect fill="#C1272D" height="8" width="24" y="16" />
    </svg>
  );
}

function UnitedKingdomFlag() {
  return (
    <svg
      aria-hidden="true"
      className="size-full"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#012169" height="24" width="24" />
      <path d="M0,0 L24,24 M24,0 L0,24" stroke="#fff" strokeWidth="4" />
      <path d="M0,0 L24,24 M24,0 L0,24" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M12,0 V24 M0,12 H24" stroke="#fff" strokeWidth="6" />
      <path d="M12,0 V24 M0,12 H24" stroke="#C8102E" strokeWidth="3.5" />
    </svg>
  );
}
