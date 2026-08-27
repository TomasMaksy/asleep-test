import { getTranslations } from "next-intl/server";
import { ProductInfoSlider } from "@/app/[locale]/products/original/sections/product-info-slider";

type Slide = {
  title: string;
  body: string;
};

export async function ProductInfoSliderSection() {
  const t = await getTranslations("productOriginal.infoSlider");

  return (
    <ProductInfoSlider
      heading={t("heading")}
      skipLabel={t("skip")}
      slides={t.raw("slides") as Slide[]}
    />
  );
}
