import { getLocale, getTranslations } from "next-intl/server";
import {
  MATTRESS_SIZES,
  mattressSaleCents,
} from "@/lib/product-original-sizes";
import { localePath } from "@/lib/seo-metadata";
import { getSiteUrl } from "@/lib/site-url";

export async function ProductJsonLd() {
  const locale = await getLocale();
  const t = await getTranslations("productOriginal");
  const site = getSiteUrl();
  const url = `${site}${localePath(locale, "/products/original")}`;
  const image = `${site}/images/product-gallery/hero-square.webp`;
  const name = t("hero.subtitle");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name,
    description: t("metadata.description"),
    url,
    image,
    brand: {
      "@type": "Brand",
      name: "asleep",
    },
    productGroupID: "matt-original",
    variesBy: ["https://schema.org/size"],
    hasVariant: MATTRESS_SIZES.map((size) => ({
      "@type": "Product",
      name: `${name} ${size.label}`,
      sku: `matt-original-${size.id}`,
      size: size.label,
      image,
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "EUR",
        price: (mattressSaleCents(size) / 100).toFixed(2),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    })),
  };

  return (
    <script
      // JSON-LD is serialized from our catalog, not user input.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
