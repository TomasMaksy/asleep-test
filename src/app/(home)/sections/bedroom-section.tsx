import Image from "next/image";
import Link from "next/link";
import { BedroomParallax } from "@/components/effects/bedroom-parallax";
import { BEDROOM } from "@/lib/copy";
import { cn } from "@/lib/utils";

const BEDROOM_OFFSETS = BEDROOM.items.map((item) => item.offset);

export function BedroomSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-screen-xl px-6 py-14 text-center lg:px-10 lg:py-32">
        <h2 className="reveal mx-auto max-w-[730px] text-brand-dark">
          {BEDROOM.heading}
        </h2>

        <BedroomParallax offsets={BEDROOM_OFFSETS}>
          {BEDROOM.items.map((item) => (
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
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    src={item.src}
                  />
                </div>
                <p className="absolute bottom-3 left-3 font-bold text-base text-white md:bottom-7 md:left-7">
                  {item.label}
                </p>
              </Link>
            </div>
          ))}
        </BedroomParallax>
      </div>
    </section>
  );
}
