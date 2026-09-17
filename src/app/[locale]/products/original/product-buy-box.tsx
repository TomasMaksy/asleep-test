import { getTranslations } from "next-intl/server";
import {
  ProductBuyControls,
  type ProductBuyControlsCopy,
} from "@/app/[locale]/products/original/product-buy-controls";

export async function ProductBuyBox() {
  const t = await getTranslations("productOriginal.hero");
  const features = t.raw("features") as string[];

  const copy: ProductBuyControlsCopy = {
    sizeLabel: t("sizeLabel"),
    heightLabel: t("heightLabel"),
    saveBadge: t("saveBadge"),
    deliveryNote: t("deliveryNote"),
    installment: t.raw("installment") as string,
    addToCart: t("addToCart"),
    configurator: t("configurator"),
    productName: t("subtitle"),
    stickyProductName: t("stickyBar.originalName"),
  };

  return (
    <div className="flex flex-col" id="product-buy-box">
      <div className="product-detail-content">
        <p>{t("description")}</p>
        <ul>
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>

      <ProductBuyControls copy={copy} />
    </div>
  );
}
