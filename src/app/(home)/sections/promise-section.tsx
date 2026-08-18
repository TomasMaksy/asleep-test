import Image from "next/image";
import { PROMISE } from "@/lib/copy";

export function PromiseSection() {
  return (
    <section className="bg-white px-6 py-16 lg:px-10 lg:py-24">
      <h2 className="mb-12 font-bold font-heading text-5xl text-brand-dark leading-none md:text-[6.25rem]">
        {PROMISE.heading}
      </h2>
      <div className="mx-auto grid max-w-screen-xl gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PROMISE.items.map((item) => (
          <article
            className="rounded-[40px] bg-brand px-8 py-10 text-white"
            key={item.title}
          >
            <Image
              alt=""
              className="mb-8 size-[60px]"
              height={60}
              src={item.icon}
              width={60}
            />
            <h3 className="mb-4 font-heading font-semibold text-2xl leading-tight">
              {item.title}
            </h3>
            <p className="font-sans text-base leading-7">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
