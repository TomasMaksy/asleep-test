import Image from "next/image";
import Link from "next/link";
import { SUPPORT } from "@/lib/copy";

export function SupportSection() {
  return (
    <section className="bg-brand-muted">
      <div className="mx-auto w-full max-w-screen-xl px-6 py-16 md:py-32 lg:px-10">
        <div className="flex flex-col gap-12 md:grid md:grid-cols-3 lg:gap-x-28">
          {SUPPORT.map((item) => (
            <article
              className="reveal flex flex-col items-center gap-y-6 text-center md:gap-y-12"
              key={item.title}
            >
              <div className="flex h-10 items-center justify-center">
                <Image
                  alt=""
                  className="h-10 w-auto object-contain"
                  height={40}
                  src={item.icon}
                  width={40}
                />
              </div>
              <div className="mx-auto flex w-64 max-w-full flex-col gap-2 text-brand-dark leading-6">
                <h3 className="font-bold font-heading text-lg md:text-xl">
                  {item.title}
                </h3>
                <p className="font-sans text-rg">{item.body}</p>
                <p>
                  <Link
                    className="font-sans text-[#1A478A] text-base underline"
                    href={item.href}
                  >
                    {item.cta}
                  </Link>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
