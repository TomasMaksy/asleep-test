import Image from "next/image";
import { MEDIA } from "@/lib/copy";

export function MediaSection() {
  const logos = [...MEDIA.logos, ...MEDIA.logos];

  return (
    <section className="bg-[#1A478A] text-white">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col justify-center overflow-hidden px-6 py-14 lg:px-10 lg:py-32">
        <div className="reveal mx-auto mb-8 lg:w-[60%]">
          <h2 className="text-center font-bold text-[2rem] text-white leading-[1.15] md:text-[3rem] md:leading-none lg:text-[4.5rem]">
            {MEDIA.heading}
          </h2>
        </div>

        <div className="reveal flex justify-center gap-[34px]">
          <div className="cursor-pointer border-white/40 border-b pb-2 font-bold text-rg text-white">
            {MEDIA.tabs[0]}
          </div>
          <div className="cursor-pointer pb-2 font-bold text-rg text-white opacity-50">
            {MEDIA.tabs[1]}
          </div>
        </div>

        <div className="relative mx-auto mt-8 w-full md:mt-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 hidden w-[120px] bg-[linear-gradient(90deg,#1A478A_60%,transparent_100%)] md:block md:w-[220px] lg:w-[320px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 hidden w-[120px] rotate-180 bg-[linear-gradient(90deg,#1A478A_60%,transparent_100%)] md:block md:w-[220px] lg:w-[320px]"
          />

          <div className="overflow-hidden">
            <div className="media-marquee flex w-max items-center gap-5">
              {logos.map((logo, index) => (
                <div
                  className="flex h-24 w-[200px] shrink-0 items-center justify-center lg:h-[150px]"
                  key={`${logo.src}-${index}`}
                >
                  <Image
                    alt={logo.alt}
                    className="h-full w-auto max-w-full object-contain"
                    height={150}
                    src={logo.src}
                    width={200}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="reveal relative mx-auto mt-10 h-[84px] w-full md:max-w-[600px]">
          <p className="text-center text-base text-white leading-7">
            {MEDIA.quote}
          </p>
        </div>
      </div>
    </section>
  );
}
