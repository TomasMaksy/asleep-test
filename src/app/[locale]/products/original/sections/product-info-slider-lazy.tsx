"use client";

import dynamic from "next/dynamic";

export type ProductInfoSliderLazyProps = {
  heading: string;
  skipLabel: string;
  slides: { title: string; body: string }[];
};

/**
 * Code-split the adjustable-sequence info slider so PDP critical JS stays
 * smaller. SSR stays on for the section shell.
 * @see https://nextjs.org/docs/app/guides/lazy-loading
 */
const ProductInfoSliderDynamic = dynamic(
  () =>
    import(
      "@/app/[locale]/products/original/sections/product-info-slider"
    ).then((mod) => ({ default: mod.ProductInfoSlider })),
  {
    loading: () => (
      <section
        aria-hidden
        className="min-h-dvh w-full bg-surface"
        id="product-info-slider"
      />
    ),
  },
);

export function ProductInfoSliderLazy(props: ProductInfoSliderLazyProps) {
  return <ProductInfoSliderDynamic {...props} />;
}
