import Link from "next/link";
import { CartBagButton } from "@/components/cart/cart-bag-button";
import { HeaderScroll } from "@/components/header-scroll";
import { ChevronIcon, Logo } from "@/components/icons";
import { NAV_LINKS } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <>
      <header
        className={cn(
          "group fixed inset-x-0 top-0 z-50 bg-transparent text-white transition-[color,translate] duration-300 ease-out",
          "after:ease after:absolute after:inset-x-0 after:top-0 after:-z-10 after:h-0 after:bg-white after:transition-all after:duration-300 after:content-['']",
          "hover:text-brand-dark hover:after:h-full hover:after:shadow-[0px_4px_20px_0px_#00000008]",
          "data-[scrolled=true]:text-brand-dark data-[scrolled=true]:after:h-full data-[scrolled=true]:after:shadow-[0px_4px_20px_0px_#00000008]",
          "data-[hidden=true]:pointer-events-none data-[hidden=true]:-translate-y-full",
        )}
        data-hidden="false"
        data-scrolled="false"
        id="site-header"
      >
        <div className="mx-auto flex h-20 w-full items-center px-5 lg:justify-between xl:max-w-[1440px] xl:px-10 2xl:max-w-[2000px]">
          <div className="flex shrink-0 grow basis-0 justify-center lg:justify-start">
            <Link aria-label="Home" className="shrink-0" href="/">
              <Logo className="duration-150" />
            </Link>
          </div>

          <nav className="mx-5 hidden h-full flex-wrap items-center gap-x-5 gap-y-2 lg:flex xl:mx-10 xl:gap-x-7">
            {NAV_LINKS.map((link) => (
              <Link
                className={cn(
                  "flex items-center gap-2.5 font-medium leading-normal duration-150",
                  "accent" in link && link.accent ? "text-red-600" : "",
                )}
                href={link.href}
                key={link.label}
              >
                {link.label}
                {"hasMenu" in link && link.hasMenu ? <ChevronIcon /> : null}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2.5 xl:gap-5">
            <Link className="hidden font-medium duration-150 lg:block" href="#">
              Lorem
            </Link>

            <CartBagButton />
          </div>
        </div>
      </header>
      <HeaderScroll />
    </>
  );
}
