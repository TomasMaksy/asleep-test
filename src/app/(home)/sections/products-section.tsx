import Image from "next/image";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductsParallax } from "@/components/effects/products-parallax";
import { CheckItem } from "@/components/ui/check-item";
import { PRODUCTS } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function ProductsSection() {
  return (
    <ProductsParallax>
      <div className="mx-auto w-full px-6 py-14 lg:py-32 xl:max-w-[1440px] xl:px-10 2xl:max-w-[2000px]">
        <div className="reveal mx-auto flex max-w-[1000px] flex-col items-center text-center">
          <h2>
            {PRODUCTS.heading[0]}
            <br />
            {PRODUCTS.heading[1]}
          </h2>
        </div>

        <div className="mt-16 md:mt-28">
          <div className="flex flex-col items-center md:gap-11 lg:flex-row">
            {PRODUCTS.items.map((product) => {
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
                        "relative mb-8 flex h-full w-full grow items-center rounded-[40px] p-12 pt-0! text-left md:min-h-[700px] md:p-16 md:pt-0!",
                        isOriginal
                          ? "bg-highlight-light text-white"
                          : "flex-row-reverse justify-end bg-highlight-default text-brand-dark md:min-h-[744px] md:justify-between md:pr-0!",
                      )}
                    >
                      <div className="w-full">
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

                        <div className="mt-4 flex flex-col gap-y-2 text-base leading-7">
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
                            "relative mb-10 max-w-[80%]",
                            isOriginal
                              ? "left-[-48px] md:left-[-64px]"
                              : "right-[-48px] ml-auto flex justify-end md:right-0",
                          )}
                        >
                          <Image
                            alt={product.imageAlt}
                            className="h-auto w-full"
                            height={525}
                            sizes="(max-width: 1024px) 80vw, 40vw"
                            src={product.image}
                            width={800}
                          />
                        </div>

                        <AddToCartButton
                          product={{
                            id: product.id,
                            name: product.title,
                            price: product.price,
                            image: product.image,
                            variant: product.sizeLabel,
                          }}
                        >
                          {product.cta}
                        </AddToCartButton>
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
