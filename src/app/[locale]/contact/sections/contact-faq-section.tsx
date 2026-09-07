import { getTranslations } from "next-intl/server";
import {
  ProductSpecsAccordion,
  type SpecItem,
} from "@/app/[locale]/products/original/sections/product-specs-accordion";

export async function ContactFaqSection() {
  const t = await getTranslations("contactPage.faq");
  const specs = await getTranslations("productOriginal.specs");
  const items = specs.raw("items") as SpecItem[];

  return (
    <section className="scroll-mt-24 bg-surface md:scroll-mt-28" id="faq">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24 lg:px-10">
        <h2 className="!text-[2rem] md:!text-[3rem] mb-10 text-center font-bold text-brand-dark leading-[1.15] md:mb-14 md:leading-none md:tracking-heading">
          {t("heading")}
        </h2>
        <ProductSpecsAccordion imageAlt={specs("firmnessAlt")} items={items} />
      </div>
    </section>
  );
}
