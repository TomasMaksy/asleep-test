import { getTranslations } from "next-intl/server";
import { CartBagButton } from "@/components/cart/cart-bag-button";
import { HeaderScroll } from "@/components/header-scroll";
import { ChevronIcon, Logo } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  theme?: "transparent" | "solid";
};

export async function SiteHeader({ theme = "transparent" }: SiteHeaderProps) {
  const t = await getTranslations("nav");
  const isSolid = theme === "solid";

  const navLinks = t.raw("links") as Array<{
    label: string;
    href: string;
    accent?: boolean;
    hasMenu?: boolean;
  }>;

  return (
    <>
      <header
        className={cn(
          "group fixed inset-x-0 top-0 z-50 transition-[color,translate] duration-300 ease-out",
          isSolid
            ? "bg-white text-brand-dark shadow-[0px_4px_20px_0px_#00000008]"
            : [
                "bg-transparent text-white",
                "after:ease after:absolute after:inset-x-0 after:top-0 after:-z-10 after:h-0 after:bg-white after:transition-all after:duration-300 after:content-['']",
                "hover:text-brand-dark hover:after:h-full hover:after:shadow-[0px_4px_20px_0px_#00000008]",
                "data-[scrolled=true]:text-brand-dark data-[scrolled=true]:after:h-full data-[scrolled=true]:after:shadow-[0px_4px_20px_0px_#00000008]",
              ],
          "data-[hidden=true]:pointer-events-none data-[hidden=true]:-translate-y-full",
        )}
        data-hidden="false"
        data-scrolled={isSolid ? "true" : "false"}
        id="site-header"
      >
        <div className="relative mx-auto flex h-16 w-full items-center px-4 lg:h-20 lg:px-5 xl:max-w-[1440px] xl:px-10 2xl:max-w-[2000px]">
          <div className="flex shrink-0 items-center lg:flex-1">
            <MobileNav
              links={navLinks}
              reviewsLabel={t("reviews")}
              solid={isSolid}
            />
            <Link
              aria-label="Home"
              className="absolute top-1/2 left-1/2 shrink-0 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0"
              href="/"
            >
              <Logo
                className="duration-150"
                variant={isSolid ? "dark" : "auto"}
              />
            </Link>
          </div>

          <nav className="mx-5 hidden h-full flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:flex xl:mx-10 xl:gap-x-7">
            {navLinks.map((link) => (
              <Link
                className={cn(
                  "flex items-center gap-2.5 font-medium leading-normal duration-150",
                  link.accent ? "text-red-600" : "",
                )}
                href={link.href}
                key={link.label}
              >
                {link.label}
                {link.hasMenu ? <ChevronIcon /> : null}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-2 lg:flex-1 lg:ml-0 xl:gap-5">
            <LanguageSwitcher compactOnMobile solid={isSolid} />

            <Link
              className="hidden font-medium duration-150 lg:block"
              href="/reviews"
            >
              {t("reviews")}
            </Link>

            <CartBagButton compactOnMobile solid={isSolid} />
          </div>
        </div>
      </header>
      <HeaderScroll />
    </>
  );
}
