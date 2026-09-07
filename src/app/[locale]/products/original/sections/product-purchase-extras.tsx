import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  ProductFaqAccordion,
  type ProductFaqItem,
} from "@/app/[locale]/products/original/product-faq-accordion";
import { staticImageUrl } from "@/lib/static-image-url";

export async function ProductPurchaseExtras() {
  const t = await getTranslations("productOriginal.hero");
  const faq = t.raw("faq") as ProductFaqItem[];

  return (
    <div className="mt-0">
      <div className="mb-7 max-w-full overflow-visible">
        <div className="inline-block max-w-full">
          <p className="mb-4 font-bold text-base text-brand-dark leading-snug">
            {t("awards.heading")}
          </p>
          <Image
            alt={t("awards.imageAlt")}
            className="block h-auto w-[112%] max-w-none object-contain object-left"
            height={171}
            src={staticImageUrl("/images/short_awards.png")}
            width={486}
          />
        </div>
      </div>

      <ProductFaqAccordion defaultOpenIndex={0} items={faq} />
    </div>
  );
}
