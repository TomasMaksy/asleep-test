import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  ProductSpecsAccordion,
  type SpecItem,
} from "@/app/[locale]/products/original/sections/product-specs-accordion";

export async function ProductSpecsSection() {
  const t = await getTranslations("productOriginal.specs");
  const items = t.raw("items") as SpecItem[];

  return (
    <section
      aria-labelledby="product-specs-heading"
      className="bg-white py-14 lg:py-32"
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-start gap-10 px-5 md:px-10 lg:gap-[150px]">
        <div className="w-full lg:w-1/2">
          <h2
            className="mb-[30px] font-bold text-[2rem] text-brand-dark leading-[1.15] md:mb-20 md:text-[3rem] md:leading-none md:tracking-heading"
            id="product-specs-heading"
          >
            {t("title")}
          </h2>

          <ProductSpecsAccordion imageAlt={t("firmnessAlt")} items={items} />
        </div>

        <div className="relative hidden lg:block lg:w-1/2">
          <Image
            alt={t("imageAlt")}
            className="h-auto w-full object-contain"
            height={1500}
            src="/images/product-specs/lifestyle.webp"
            width={1252}
          />
        </div>
      </div>
    </section>
  );
}
