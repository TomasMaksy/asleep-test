import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { staticImageUrl } from "@/lib/static-image-url";

const HERO_TYPE: Record<Locale, { desktop: string; mobile: string }> = {
  en: {
    desktop: "top-[21.4%] w-[54%] text-[7.4cqw]",
    mobile: "top-[27.8%] w-[94%] text-[14cqw]",
  },
  lt: {
    desktop: "top-[21.4%] w-[60%] text-[7.4cqw]",
    mobile: "top-[27.8%] w-[98%] text-[12.5cqw]",
  },
};

const HERO_DESKTOP = staticImageUrl("/images/hero-banner-desktop.webp");
const HERO_MOBILE = staticImageUrl("/images/hero-banner-mobile.webp");
const HERO_PEOPLE = staticImageUrl("/images/hero-people.webp");

async function HeroHeadline({
  peopleClassName,
  textClassName,
}: {
  peopleClassName: string;
  textClassName: string;
}) {
  const t = await getTranslations("hero");
  const lineThree = t("lineThree");
  const typeClassName = `absolute left-1/2 m-0 flex -translate-x-1/2 flex-col items-center gap-[0.08em] text-center font-black font-heading text-white leading-none tracking-heading ${textClassName}`;

  return (
    <>
      <h1 className="sr-only">
        {t("lineOne")} {t("lineTwo")} {lineThree}
      </h1>
      <div className="hero-enter-left absolute inset-0 z-10">
        <p aria-hidden="true" className={typeClassName}>
          <span className="block whitespace-nowrap">{t("lineOne")}</span>
        </p>
      </div>
      <div className={`pointer-events-none absolute z-20 ${peopleClassName}`}>
        <Image
          alt=""
          className="h-auto w-full"
          height={1593}
          sizes="45vw"
          src={HERO_PEOPLE}
          width={1800}
        />
      </div>
      <div className="hero-enter-right absolute inset-0 z-30">
        <p aria-hidden="true" className={typeClassName}>
          <span className="invisible block whitespace-nowrap">
            {t("lineOne")}
          </span>
          <span className="block whitespace-nowrap">{t("lineTwo")}</span>
          {lineThree ? (
            <span className="block whitespace-nowrap">{lineThree}</span>
          ) : null}
        </p>
      </div>
    </>
  );
}

export async function HeroSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("hero");
  const type = HERO_TYPE[locale];

  return (
    <section className="relative flex h-(--hero-height) flex-col items-center overflow-hidden bg-[#1A478A] pb-8 lg:-mt-5">
      <link
        as="image"
        fetchPriority="high"
        href={HERO_DESKTOP}
        media="(min-width: 768px)"
        rel="preload"
      />
      <link
        as="image"
        fetchPriority="high"
        href={HERO_MOBILE}
        media="(max-width: 767px)"
        rel="preload"
      />

      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="@container hero-artboard hero-artboard--desktop">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={HERO_DESKTOP}
          />
          <HeroHeadline
            peopleClassName="left-[29.42%] top-[23.07%] w-[43.45%]"
            textClassName={type.desktop}
          />
        </div>

        <div className="@container hero-artboard hero-artboard--mobile">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="100vw"
            src={HERO_MOBILE}
          />
          <HeroHeadline
            peopleClassName="-left-[2.06%] top-[30.19%] w-[100.92%]"
            textClassName={type.mobile}
          />
        </div>
      </div>

      <div className="absolute right-0 bottom-8 z-10 w-full px-5 md:bottom-10 md:px-10">
        <div className="w-full items-center md:flex lg:block xl:mx-auto xl:max-w-[1440px] 2xl:max-w-[2000px]">
          <div className="mb-0 flex items-center justify-center md:mb-4 lg:-mb-24">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-center font-sans text-[#1A478A] text-base tracking-normal transition-colors duration-300 hover:bg-brand-muted"
              href="/products/original"
            >
              {t("cta")}
            </Link>
          </div>
          <div className="mt-0 ml-auto w-full origin-bottom scale-[85%] text-center md:w-fit md:max-w-[46rem] md:scale-100">
            <p className="mx-auto mb-0 w-fit font-bold font-heading text-base text-white leading-tight">
              {t("awardsCaption")}
            </p>
            <Image
              alt=""
              className="z-40 mx-auto h-auto w-[300px] object-contain md:w-[357px]"
              height={171}
              sizes="(max-width: 768px) 300px, 357px"
              src="/images/awards.webp"
              width={486}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
