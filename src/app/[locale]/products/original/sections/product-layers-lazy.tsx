"use client";

import dynamic from "next/dynamic";
import type { LayerItem } from "@/app/[locale]/products/original/sections/product-layers";

export type ProductLayersLazyProps = {
  advantagesLabel: string;
  className?: string;
  closeLabel: string;
  heading: string;
  items: LayerItem[];
  nextLabel: string;
  previousLabel: string;
};

/**
 * Code-split the heavy layers island (motion + portal UI) so home/PDP
 * critical JS stays smaller. SSR stays on for the section shell.
 * @see https://nextjs.org/docs/app/guides/lazy-loading
 */
const ProductLayersDynamic = dynamic(
  () =>
    import("@/app/[locale]/products/original/sections/product-layers").then(
      (mod) => ({ default: mod.ProductLayers }),
    ),
  {
    loading: () => (
      <section
        aria-hidden
        className="min-h-[70vh] w-full bg-highlight-default"
      />
    ),
  },
);

export function ProductLayersLazy(props: ProductLayersLazyProps) {
  return <ProductLayersDynamic {...props} />;
}
