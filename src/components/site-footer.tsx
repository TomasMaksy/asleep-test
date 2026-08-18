import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FOOTER } from "@/lib/copy";

const PAYMENTS = ["1", "7", "9", "19", "20", "21"] as const;

export function SiteFooter() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-screen-xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1.6fr] lg:px-10">
        <div className="flex flex-col gap-8">
          <Logo />
          <form className="flex max-w-md items-center rounded-full bg-white/10 p-1.5">
            <input
              aria-label={FOOTER.newsletter}
              className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/50"
              placeholder={FOOTER.newsletter}
              type="email"
            />
            <Button className="h-10 px-5 py-0 text-sm" href="#">
              {FOOTER.subscribe}
            </Button>
          </form>
          <div>
            <p className="mb-3 text-sm text-white/60">{FOOTER.payments}</p>
            <div className="flex flex-wrap items-center gap-2">
              {PAYMENTS.map((id) => (
                <Image
                  alt=""
                  className="h-8 w-auto rounded-md bg-white"
                  height={32}
                  key={id}
                  src={`/images/payments/${id}.svg`}
                  width={48}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER.columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 font-bold font-heading text-sm text-white/70">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link className="text-sm hover:underline" href="#">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="px-6 pb-8 text-right font-heading text-sm text-white/80 lg:px-10">
        {FOOTER.tagline}
      </p>
    </footer>
  );
}
