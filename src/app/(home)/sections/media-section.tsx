import Image from "next/image";
import { MEDIA } from "@/lib/copy";

export function MediaSection() {
  return (
    <section className="bg-white">
      <div className="px-6 pt-8 lg:px-10">
        <h2 className="mb-8 text-center font-bold font-heading text-4xl text-brand-dark leading-none md:text-[4.5rem]">
          {MEDIA.heading}
        </h2>
        <div className="mb-8 flex justify-center gap-8 font-heading font-semibold text-lg">
          <span className="border-brand border-b-2 pb-1 text-brand">
            {MEDIA.tabs[0]}
          </span>
          <span className="text-brand-dark/40">{MEDIA.tabs[1]}</span>
        </div>
      </div>
      <div className="flex min-h-[220px] items-center justify-center bg-brand px-6 py-16 text-center">
        <p className="max-w-3xl font-sans text-lg text-white md:text-xl">
          {MEDIA.quote}
        </p>
      </div>
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center gap-x-8 gap-y-6 px-6 py-12 lg:px-10">
        {MEDIA.logos.map((logo) => (
          <Image
            alt={logo.alt}
            className="h-[80px] w-auto object-contain md:h-[110px]"
            height={150}
            key={logo.src}
            src={logo.src}
            width={200}
          />
        ))}
      </div>
    </section>
  );
}
