import Image from "next/image";
import { CheckItem } from "@/components/ui/check-item";
import { BUNDLES } from "@/lib/copy";

export function BundlesSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full px-6 py-20 lg:px-10 xl:max-w-[1440px] 2xl:max-w-[2000px]">
        <h2 className="reveal mb-12 text-center text-brand-dark">
          {BUNDLES.heading}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {BUNDLES.items.map((bundle) => (
            <article
              className="overflow-hidden rounded-[20px] border border-[#e1e1e1] bg-white"
              key={bundle.title}
            >
              <div className="relative">
                <span className="absolute top-4 left-4 z-10 rounded-md bg-[#DC2626] px-2 py-1 font-sans text-sm text-white">
                  {bundle.badge}
                </span>
                <Image
                  alt=""
                  className="aspect-square w-full object-cover"
                  height={428}
                  src={bundle.image}
                  width={428}
                />
              </div>
              <div className="px-6 pt-2 pb-8">
                <h3 className="mb-4 font-bold font-heading text-brand-dark text-xl">
                  {bundle.title}
                </h3>
                <div className="flex flex-col gap-2 text-brand-dark text-rg">
                  {bundle.features.map((feature) => (
                    <CheckItem
                      className="text-brand-dark"
                      iconClassName="text-[#1A478A]"
                      key={feature}
                    >
                      {feature}
                    </CheckItem>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
