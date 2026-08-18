import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { HERO } from "@/lib/copy";

export function HeroSection() {
  return (
    <section className="relative h-[100svh] min-h-[700px] overflow-hidden bg-brand lg:h-[1020px]">
      <Image
        alt=""
        className="hidden object-cover object-center lg:block"
        fill
        priority
        sizes="(min-width: 1024px) 100vw, 1px"
        src="/images/hero-banner-desktop.png"
      />
      <Image
        alt=""
        className="object-cover object-center lg:hidden"
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 1px"
        src="/images/hero-banner-mobile.png"
      />

      <SiteHeader />

      <div className="relative z-10 flex h-full flex-col items-center pt-20">
        <h1 className="relative flex w-full max-w-[720px] flex-col items-center px-4 text-center font-black font-heading text-white">
          <span className="relative z-0 mt-2 text-[clamp(2.5rem,5.5vw,4.75rem)] leading-[0.9] tracking-tight">
            {HERO.lineOne}
          </span>
          <span className="pointer-events-none absolute top-[38%] z-0 w-[min(659px,92vw)] text-[clamp(2.4rem,5.8vw,5.4rem)] leading-[0.88] tracking-tight">
            {HERO.lineTwo}
            <br />
            {HERO.lineThree}
          </span>
          <div className="relative z-10 -mt-4 w-[min(626px,90vw)]">
            <Image
              alt=""
              className="h-auto w-full"
              height={573}
              priority
              src="/images/hero-people.png"
              width={648}
            />
          </div>
        </h1>

        <Button
          className="relative z-20 mt-2 h-[52px] min-w-[184px] px-8 font-medium"
          href="#"
        >
          {HERO.cta}
        </Button>
      </div>

      <div className="absolute right-6 bottom-8 z-20 hidden w-[357px] text-right md:block lg:right-10">
        <p className="mb-2 font-sans text-sm text-white">
          {HERO.awardsCaption}
        </p>
        <Image
          alt=""
          className="ml-auto h-auto w-full"
          height={125}
          src="/images/awards.png"
          width={357}
        />
      </div>
    </section>
  );
}
