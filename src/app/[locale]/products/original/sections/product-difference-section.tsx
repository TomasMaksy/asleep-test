import { getTranslations } from "next-intl/server";
import { DifferenceVideo } from "@/app/[locale]/products/original/sections/product-difference-video";
import { cn } from "@/lib/utils";

type BlockCopy = {
  title: string;
  body: string;
};

const BLOCKS = [
  {
    id: "locally",
    video: "/images/product-difference/locally.mp4",
    flipped: false,
  },
  {
    id: "research",
    video: "/images/product-difference/research.mp4",
    flipped: true,
  },
  {
    id: "tested",
    video: "/images/product-difference/tested.mp4",
    flipped: false,
  },
] as const;

export async function ProductDifferenceSection() {
  const t = await getTranslations("productOriginal.difference");
  const copy = t.raw("blocks") as BlockCopy[];

  return (
    <section
      aria-labelledby="product-difference-heading"
      className="bg-brand-dark py-14 text-white lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <h2
          className="mb-9 text-center font-bold text-[3rem] leading-none md:mb-25 md:text-[4.5rem] lg:mb-15"
          id="product-difference-heading"
        >
          {t("heading")}
        </h2>

        <div className="flex flex-col gap-25">
          {BLOCKS.map((block, index) => {
            const item = copy[index];
            if (!item) {
              return null;
            }

            return (
              <article
                className={cn(
                  "flex flex-col items-center gap-10 md:gap-25",
                  block.flipped ? "md:flex-row-reverse" : "md:flex-row",
                )}
                key={block.id}
              >
                <div className="h-full w-full overflow-hidden rounded-[40px] md:w-1/2">
                  <DifferenceVideo
                    pauseLabel={t("pause")}
                    playLabel={t("play")}
                    src={block.video}
                  />
                </div>
                <div className="flex w-full flex-col justify-center md:w-1/2">
                  <h3 className="font-bold text-[2rem] leading-[1.15] md:text-[3rem] md:leading-none md:tracking-heading">
                    {item.title}
                  </h3>
                  <p className="mt-5 text-base leading-[1.75]">{item.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
