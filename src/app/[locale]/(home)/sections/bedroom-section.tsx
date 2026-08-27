import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BedroomParallax } from "@/components/effects/bedroom-parallax";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BedroomItem = {
  label: string;
  src: string;
  alt: string;
  href: string;
  className: string;
  offset: number;
};

export async function BedroomSection() {
  const t = await getTranslations("bedroom");
  const items = t.raw("items") as BedroomItem[];
  const bedroomOffsets = items.map((item) => item.offset);

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-screen-xl px-6 py-14 text-center lg:px-10 lg:py-32">
        <h2 className="reveal mx-auto max-w-[730px] text-brand-dark">
          {t("heading")}
        </h2>

        <BedroomParallax offsets={bedroomOffsets}>
          {items.map((item) => (
            <div
              className={cn("will-change-transform", item.className)}
              data-bedroom-cell=""
              key={item.label}
              style={{ transform: `translateY(${item.offset}px)` }}
            >
              <Link
                className="relative z-10 block h-full transform-gpu text-left duration-500 ease-in-out"
                href={item.href}
              >
                <div className="relative h-full w-full overflow-hidden rounded-3xl lg:rounded-[40px]">
                  <Image
                    alt={item.alt}
                    className="h-full w-full object-cover duration-500 ease-in-out hover:scale-105"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    src={item.src}
                  />
                  <p className="absolute bottom-4 left-4 font-bold font-heading text-lg text-white leading-tight md:bottom-8 md:left-8 md:text-xl">
                    {item.label}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </BedroomParallax>
      </div>
    </section>
  );
}
