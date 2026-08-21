import Image from "next/image";
import { PROMISE } from "@/lib/copy";

export function PromiseSection() {
  return (
    <section className="bg-[#2B2D41] py-14 text-white lg:py-32">
      <div className="mx-auto w-full max-w-screen-xl px-6 text-center lg:px-10">
        <h2 className="reveal mb-14 font-bold text-[3rem] leading-none md:mb-28 md:text-[4.5rem] lg:text-[6.25rem]">
          {PROMISE.heading}
        </h2>

        <div className="flex flex-col flex-wrap items-baseline justify-between gap-x-6 gap-y-20 sm:flex-row md:gap-y-24 lg:gap-24">
          {PROMISE.items.map((item) => (
            <article
              className="reveal flex w-full flex-col items-center justify-center text-center sm:w-[calc(50%-20px)] lg:w-full lg:flex-1"
              key={item.title}
            >
              <Image
                alt=""
                className="mx-auto size-[60px]"
                height={60}
                src={item.icon}
                width={60}
              />
              <h3 className="pt-12 pb-5 font-heading font-semibold text-[2rem] leading-[1.15] md:pt-24">
                {item.title}
              </h3>
              <p className="font-sans text-rg text-white leading-[1.8] md:text-base md:leading-7">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
