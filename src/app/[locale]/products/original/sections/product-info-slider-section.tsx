import { getTranslations } from "next-intl/server";
import { ProductInfoSliderLazy } from "@/app/[locale]/products/original/sections/product-info-slider-lazy";

type Slide = {
  title: string;
  body: string;
};

export async function ProductInfoSliderSection() {
  const t = await getTranslations("productOriginal.infoSlider");

  return (
    <ProductInfoSliderLazy
      heading={t("heading")}
      skipLabel={t("skip")}
      slides={t.raw("slides") as Slide[]}
    />
  );
}
