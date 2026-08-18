import { PlayIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { REVIEWS } from "@/lib/copy";

export function ReviewsSection() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-center bg-cover opacity-90"
        style={{ backgroundImage: "url(/images/review-wall.svg)" }}
      />
      <div className="relative flex flex-col items-center px-6 py-24 lg:py-32">
        <Button
          className="mb-24 gap-2 bg-brand px-6 py-3 text-white hover:bg-brand-dark"
          href="#"
        >
          <PlayIcon />
          {REVIEWS.commercial}
        </Button>
        <p className="font-bold font-heading text-5xl text-brand-dark leading-none md:text-[6.25rem]">
          {REVIEWS.stat}
        </p>
        <p className="mt-3 text-brand-dark text-lg">{REVIEWS.caption}</p>
        <Button
          className="mt-8 h-[49px] min-w-[144px]"
          href="#"
          variant="solid-brand"
        >
          {REVIEWS.cta}
        </Button>
      </div>
    </section>
  );
}
