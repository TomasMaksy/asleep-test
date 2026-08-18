import Link from "next/link";
import { SUPPORT } from "@/lib/copy";

export function SupportSection() {
  return (
    <section className="bg-brand-muted px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto grid max-w-screen-xl gap-12 md:grid-cols-3">
        {SUPPORT.map((item) => (
          <article className="text-center" key={item.title}>
            <h3 className="mb-3 font-bold font-heading text-brand-dark text-xl">
              {item.title}
            </h3>
            <p className="mb-4 font-sans text-base text-brand-dark/80">
              {item.body}
            </p>
            <Link className="font-sans text-brand underline" href={item.href}>
              {item.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
