import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ConfiguratorParallax } from "@/components/effects/configurator-parallax";
import { Link } from "@/i18n/navigation";
import { staticImageUrl } from "@/lib/static-image-url";

export async function ProductConfiguratorSection() {
  const t = await getTranslations("productOriginal.configurator");

  return (
    <section className="overflow-hidden bg-highlight-light px-5 pt-16 pb-8 text-white md:px-10 md:py-24">
      <ConfiguratorParallax>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div
            className="relative z-0 will-change-transform"
            data-parallax="fast"
          >
            <p className="font-medium text-sm text-white/90 uppercase tracking-[0.12em]">
              {t("overline")}
            </p>
            <h2 className="mt-3 font-black text-[3.5rem] leading-none tracking-heading md:text-[4rem]">
              {t("title")}
            </h2>
          </div>

          <div
            className="relative z-10 -mt-2 w-full max-w-[560px] will-change-transform md:-mt-5"
            data-parallax="slow"
          >
            <div className="relative">
              <Image
                alt={t("imageAlt")}
                className="relative z-10 mx-auto h-auto w-full"
                height={425}
                priority={false}
                src={staticImageUrl("/images/configurator/section.png")}
                width={641}
              />
              <div className="pointer-events-none absolute inset-x-[-1%] -bottom-[62px] z-0 md:inset-x-[1%] md:-bottom-[90px]">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-auto w-full origin-center scale-y-[0.8] opacity-40 blur-[4px] md:scale-y-[0.94] md:opacity-70 md:blur-0"
                  height={124}
                  src={staticImageUrl(
                    "/images/configurator/section-shadow.png",
                  )}
                  width={719}
                />
              </div>
            </div>
          </div>

          <div
            className="relative z-0 mt-28 will-change-transform"
            data-parallax="fast"
          >
            <Link
              className="inline-flex min-h-12 max-w-full items-center justify-center rounded-full bg-white px-8 py-3 text-center text-[#244f9c] text-base transition-colors hover:bg-white/90"
              href="/configurator"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </ConfiguratorParallax>
    </section>
  );
}
