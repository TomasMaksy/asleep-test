import { getTranslations } from "next-intl/server";
import { ConfiguratorLink } from "@/components/configurator/configurator-link";
import { ProductsParallax } from "@/components/effects/products-parallax";
import { ProductUnpackVideo } from "@/components/product/product-unpack-video";
import { CheckItem } from "@/components/ui/check-item";
import { Link } from "@/i18n/navigation";
import { staticImageUrl } from "@/lib/static-image-url";
import { cn } from "@/lib/utils";

type ProductItem = {
  id: string;
  title: string;
  variant: "dark" | "light";
  image: string;
  imageAlt: string;
  cta: string;
  price: number;
  sizeLabel: string;
  features: string[];
};

export async function ProductsSection() {
  const t = await getTranslations("products");
  const heading = t.raw("heading") as [string, string];
  const items = t.raw("items") as ProductItem[];

  return (
    <ProductsParallax>
      <div className="mx-auto w-full px-6 py-14 lg:py-32 xl:max-w-[1440px] xl:px-10 2xl:max-w-[2000px]">
        <div className="reveal mx-auto flex max-w-[1000px] flex-col items-center text-center">
          <h2>
            {heading[0]}
            <br />
            {heading[1]}
          </h2>
        </div>

        <div className="mt-16 md:mt-28">
          <div className="flex flex-col items-center md:gap-11 lg:flex-row lg:items-start">
            {items.map((product) => {
              const isOriginal = product.variant === "dark";

              return (
                <div
                  className="w-full lg:w-1/2"
                  data-parallax={isOriginal ? "original" : "hybrid"}
                  key={product.id}
                >
                  <div className="flex w-full grow flex-col gap-y-11">
                    <article
                      className={cn(
                        "relative mb-8 flex h-full w-full grow flex-col rounded-[40px] p-12 pt-0! text-left md:p-16 md:pt-0!",
                        isOriginal
                          ? "overflow-hidden bg-highlight-light pb-10 text-white md:min-h-[620px] md:pb-12"
                          : "overflow-hidden bg-highlight-default text-brand-dark md:min-h-[660px] md:pr-0!",
                      )}
                    >
                      <div className="flex w-full flex-1 flex-col">
                        <div
                          className={cn(
                            "flex justify-between gap-2",
                            !isOriginal && "md:pr-16",
                          )}
                        >
                          <h3 className="pt-12 font-bold text-[2rem] tracking-heading md:pt-16 md:text-[4.5rem] md:leading-none">
                            {product.title}
                          </h3>
                        </div>

                        <div
                          className={cn(
                            "mt-4 flex flex-col text-base leading-snug",
                            isOriginal ? "gap-y-5" : "gap-y-6",
                          )}
                        >
                          {product.features.map((feature) => (
                            <CheckItem
                              className={
                                isOriginal ? "text-white" : "text-brand-dark"
                              }
                              iconClassName={
                                isOriginal ? "text-white" : "text-brand-dark"
                              }
                              key={feature}
                            >
                              {feature}
                            </CheckItem>
                          ))}
                        </div>

                        <div
                          className={cn(
                            "relative",
                            isOriginal
                              ? "-ml-12 mt-8 mb-6 w-[calc(85%+3rem)] max-w-[460px] md:-ml-16 md:mt-8 md:mb-8 md:w-[calc(80%+4rem)] md:max-w-[500px]"
                              : "-mr-12 mb-10 ml-auto mt-10 w-[calc(95%+3rem)] max-w-[520px] md:-mr-16 md:mt-12 md:mb-14 md:w-[calc(90%+4rem)] md:max-w-[580px]",
                          )}
                        >
                          {isOriginal ? (
                            <div className="relative">
                              <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 bottom-[-2%] h-[28%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(10,24,56,0.45)_0%,rgba(10,24,56,0.18)_42%,transparent_70%)] blur-md"
                              />
                              <div className="relative z-10 [filter:drop-shadow(0_16px_18px_rgba(10,24,56,0.35))_drop-shadow(0_5px_8px_rgba(10,24,56,0.22))]">
                                <ProductUnpackVideo alt={product.imageAlt} />
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 bottom-[0%] h-[26%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(26,40,60,0.28)_0%,rgba(26,40,60,0.1)_45%,transparent_72%)] blur-md"
                              />
                              {/* biome-ignore lint/performance/noImgElement: next/image flattens WebP alpha onto black */}
                              <img
                                alt={product.imageAlt}
                                className="relative z-10 h-auto w-full object-contain object-right [filter:drop-shadow(0_14px_16px_rgba(26,40,60,0.16))_drop-shadow(0_4px_6px_rgba(26,40,60,0.1))]"
                                decoding="async"
                                height={449}
                                src={staticImageUrl(product.image)}
                                width={1217}
                              />
                            </div>
                          )}
                        </div>

                        {isOriginal ? (
                          <Link
                            className="relative z-10 mt-auto inline-flex h-10 w-fit shrink-0 items-center justify-center self-start rounded-full bg-white px-6 font-sans text-[#1A478A] text-[0.875rem] leading-[1.8] tracking-normal transition-colors duration-300 hover:bg-brand-muted"
                            href="/products/original"
                          >
                            {product.cta}
                          </Link>
                        ) : (
                          <ConfiguratorLink className="relative z-10 mt-auto inline-flex h-10 w-fit shrink-0 items-center justify-center self-start rounded-full bg-white px-6 font-sans text-[#1A478A] text-[0.875rem] leading-[1.8] tracking-normal transition-colors duration-300 hover:bg-brand-muted">
                            {product.cta}
                          </ConfiguratorLink>
                        )}
                      </div>
                    </article>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ProductsParallax>
  );
}
