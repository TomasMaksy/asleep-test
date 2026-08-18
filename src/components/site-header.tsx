import Image from "next/image";
import Link from "next/link";
import { BagIcon, ChevronIcon, Logo } from "@/components/icons";
import { NAV_LINKS } from "@/lib/copy";

export function SiteHeader() {
  const tone = "text-white";

  return (
    <header
      className={`absolute inset-x-0 top-0 z-30 flex h-20 items-center justify-between px-6 lg:px-10 ${tone}`}
    >
      <Link aria-label="Home" className="shrink-0" href="/">
        <Logo />
      </Link>

      <nav className="hidden items-center gap-7 xl:flex">
        {NAV_LINKS.map((link) => (
          <Link
            className={`flex items-center gap-1.5 font-sans text-sm ${
              "accent" in link && link.accent ? "text-red-600" : ""
            }`}
            href={link.href}
            key={link.label}
          >
            {link.label}
            {"hasMenu" in link && link.hasMenu ? <ChevronIcon /> : null}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-current px-3 py-1.5 text-sm">
            <Image
              alt=""
              className="size-4 rounded-sm object-cover"
              height={16}
              src="/images/flags/gb.svg"
              width={16}
            />
            EN
            <ChevronIcon />
          </summary>
          <div className="absolute right-0 mt-2 min-w-28 rounded-xl bg-white py-2 text-brand-dark shadow-md">
            <Link
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
              href="#"
            >
              <Image alt="" height={16} src="/images/flags/gb.svg" width={16} />
              EN
            </Link>
            <Link
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
              href="#"
            >
              <Image alt="" height={16} src="/images/flags/nl.svg" width={16} />
              NL
            </Link>
            <Link
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
              href="#"
            >
              <Image alt="" height={16} src="/images/flags/be.svg" width={16} />
              BE
            </Link>
          </div>
        </details>

        <Link className="hidden text-sm xl:block" href="#">
          Lorem
        </Link>

        <Link
          aria-label="Cart"
          className="flex size-10 items-center justify-center rounded-full border border-current"
          href="#"
        >
          <BagIcon />
        </Link>
      </div>
    </header>
  );
}
