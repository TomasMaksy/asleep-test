import { getTranslations } from "next-intl/server";
import type { LayerItem } from "@/app/[locale]/products/original/sections/product-layers";
import { ProductLayersLazy } from "@/app/[locale]/products/original/sections/product-layers-lazy";

const ITEM_IDS = [
  "tencel",
  "memoryFoam",
  "hypersupport",
  "coldFoamSoft",
  "coldFoamFirm",
  "comfortZones",
  "nonSlip",
  "cover",
] as const;

export async function ProductLayersSection({
  className,
}: {
  className?: string;
}) {
  const t = await getTranslations("productOriginal.layers");

  const items: LayerItem[] = ITEM_IDS.map((id) => {
    const advantages = t.has(`items.${id}.advantages`)
      ? (t.raw(`items.${id}.advantages`) as string[])
      : undefined;
    const bodyExtra = t.has(`items.${id}.bodyExtra`)
      ? t(`items.${id}.bodyExtra`)
      : undefined;

    return {
      id,
      title: t(`items.${id}.title`),
      body: t(`items.${id}.body`),
      bodyExtra,
      advantages,
      selectLabel: t("selectLayer", { title: t(`items.${id}.title`) }),
      mediaAlt: t.has(`items.${id}.mediaAlt`)
        ? t(`items.${id}.mediaAlt`)
        : t(`items.${id}.title`),
    };
  });

  return (
    <ProductLayersLazy
      advantagesLabel={t("advantages")}
      className={className}
      closeLabel={t("close")}
      heading={t("heading")}
      items={items}
      nextLabel={t("nextLayer")}
      previousLabel={t("previousLayer")}
    />
  );
}
