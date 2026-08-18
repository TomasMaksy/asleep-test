import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckItem } from "@/components/ui/check-item";
import { PRODUCTS } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function ProductsSection() {
  return (
    <section className="bg-white px-6 pt-16 pb-8 lg:px-10 lg:pt-24">
      <h2 className="mx-auto mb-12 max-w-screen-xl font-bold font-heading text-5xl text-brand-dark leading-none md:text-[6.25rem]">
        {PRODUCTS.heading[0]}
        <br />
        {PRODUCTS.heading[1]}
      </h2>

      <div className="mx-auto grid max-w-screen-xl gap-6 lg:grid-cols-2 lg:items-start">
        {PRODUCTS.items.map((product, index) => (
          <article
            className={cn(
              "relative overflow-hidden rounded-[40px] lg:rounded-[60px]",
              product.variant === "dark"
                ? "bg-brand text-white"
                : "bg-surface text-brand-dark",
              index === 1 && "lg:mt-24",
            )}
            key={product.id}
          >
            <div className="flex min-h-[700px] flex-col p-8 pb-10 lg:p-12">
              <h3 className="font-bold font-heading text-[3rem] leading-none lg:text-[4.5rem]">
                {product.title}
              </h3>
              <div
                className={cn(
                  "mt-8 flex max-w-[85%] flex-col gap-3 text-rg",
                  product.variant === "dark" ? "text-white" : "text-brand-dark",
                )}
              >
                {product.features.map((feature) => (
                  <CheckItem
                    className={
                      product.variant === "dark"
                        ? "text-white"
                        : "text-brand-dark"
                    }
                    iconClassName={
                      product.variant === "dark" ? "text-white" : "text-brand"
                    }
                    key={feature}
                  >
                    {feature}
                  </CheckItem>
                ))}
              </div>

              <div className="relative mt-auto pt-16">
                <Image
                  alt={product.imageAlt}
                  className={cn(
                    "absolute right-[-12%] bottom-[-8%] h-auto w-[85%] max-w-[640px]",
                    product.variant === "dark" && "mix-blend-screen",
                  )}
                  height={420}
                  src={product.image}
                  width={800}
                />
                <Button
                  className="relative z-10 h-10 px-6 py-0 text-sm"
                  href="#"
                >
                  {product.cta}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
