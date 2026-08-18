import Image from "next/image";
import { BEDROOM } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function BedroomSection() {
  return (
    <section className="bg-white px-6 py-16 lg:px-10 lg:py-24">
      <h2 className="mb-12 text-center font-bold font-heading text-4xl text-[#d1dae8] leading-none md:text-[4.5rem]">
        {BEDROOM.heading[0]}
        <br />
        {BEDROOM.heading[1]}
      </h2>
      <div className="mx-auto grid max-w-screen-xl grid-cols-2 gap-4 lg:grid-cols-3 lg:grid-rows-2">
        {BEDROOM.images.map((image) => (
          <div
            className={cn(
              "relative min-h-[242px] overflow-hidden",
              image.className,
            )}
            key={image.src}
          >
            <Image
              alt={image.alt}
              className="h-full w-full object-cover"
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              src={image.src}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
