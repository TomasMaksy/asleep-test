import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HERO } from "@/lib/copy";

function HeroHeadline({
  peopleClassName,
  textClassName,
}: {
  peopleClassName: string;
  textClassName: string;
}) {
  const typeClassName = `absolute left-1/2 m-0 flex -translate-x-1/2 flex-col items-center gap-[0.08em] text-center font-black font-heading text-white leading-none tracking-[-0.045em] ${textClassName}`;

  return (
    <>
      <h1 className="sr-only">
        {HERO.lineOne} {HERO.lineTwo} {HERO.lineThree}
      </h1>
      <div className="hero-enter-left absolute inset-0 z-10">
        <p aria-hidden="true" className={typeClassName}>
          <span className="block">{HERO.lineOne}</span>
        </p>
      </div>
      <div className={`pointer-events-none absolute z-20 ${peopleClassName}`}>
        <Image
          alt=""
          className="h-auto w-full"
          height={2843}
          sizes="45vw"
          src="/images/hero-people.webp"
          width={3214}
        />
      </div>
      <div className="hero-enter-right absolute inset-0 z-30">
        <p aria-hidden="true" className={typeClassName}>
          <span className="invisible block">{HERO.lineOne}</span>
          <span className="block">{HERO.lineTwo}</span>
          <span className="block">{HERO.lineThree}</span>
        </p>
      </div>
    </>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex h-[calc(100vh-48px)] flex-col items-center overflow-hidden bg-[#1A478A] pb-8 lg:-mt-5">
      {/* Media-specific LCP preloads — only the visible artboard is prioritized */}
      <link
        as="image"
        fetchPriority="high"
        href="/images/hero-banner-desktop.webp"
        media="(min-width: 768px)"
        rel="preload"
      />
      <link
        as="image"
        fetchPriority="high"
        href="/images/hero-banner-mobile.webp"
        media="(max-width: 767px)"
        rel="preload"
      />

      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="@container absolute top-1/2 left-1/2 hidden aspect-[2560/1813] w-[max(100%,calc((100vh-48px)*1.41202))] -translate-x-1/2 -translate-y-1/2 md:block">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(min-width: 768px) 100vw, 1px"
            src="/images/hero-banner-desktop.webp"
          />
          <HeroHeadline
            peopleClassName="left-[29.42%] top-[23.07%] w-[43.45%]"
            textClassName="top-[23.4%] w-[52%] text-[6.2cqw]"
          />
        </div>

        <div className="@container absolute top-1/2 left-1/2 aspect-[780/1688] w-[max(100%,calc((100vh-48px)*0.46209))] -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(max-width: 767px) 100vw, 1px"
            src="/images/hero-banner-mobile.webp"
          />
          <HeroHeadline
            peopleClassName="-left-[2.06%] top-[30.19%] w-[100.92%]"
            textClassName="top-[29.8%] w-[92%] text-[11.8cqw]"
          />
        </div>
      </div>

      <div className="absolute right-0 bottom-8 z-10 w-full px-5 md:bottom-10 md:px-10">
        <div className="w-full items-center md:flex lg:block xl:mx-auto xl:max-w-[1440px] 2xl:max-w-[2000px]">
          <div className="mb-0 flex items-center justify-center md:mb-4 lg:-mb-24">
            <Button href="#">{HERO.cta}</Button>
          </div>
          <div className="mt-0 ml-auto w-full origin-bottom scale-[85%] text-center md:w-fit md:max-w-[46rem] md:scale-100">
            <p className="mx-auto mb-0 w-fit font-bold font-heading text-base text-white leading-tight">
              {HERO.awardsCaption}
            </p>
            <Image
              alt=""
              className="z-40 mx-auto h-auto w-[300px] object-contain md:w-[357px]"
              height={171}
              sizes="(max-width: 768px) 300px, 357px"
              src="/images/awards.png"
              width={486}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
