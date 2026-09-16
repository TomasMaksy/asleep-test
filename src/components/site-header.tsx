import { CartBagButton } from "@/components/cart/cart-bag-button";
import { HeaderScroll } from "@/components/header-scroll";
import { Logo } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  theme?: "transparent" | "solid";
  variant?: "full" | "minimal";
};

export async function SiteHeader({
  theme = "transparent",
  variant = "full",
}: SiteHeaderProps) {
  const isMinimal = variant === "minimal";
  const isSolid = theme === "solid" || isMinimal;

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
          <Link aria-label="Home" className="shrink-0" href="/">
            <Logo
              className="duration-150"
              variant={isSolid ? "dark" : "auto"}
            />
          </Link>
          <div className="ml-auto flex items-center gap-2 xl:gap-5">
            <LanguageSwitcher compactOnMobile solid={isSolid} />
            <CartBagButton compactOnMobile solid={isSolid} />
          </div>
        </div>
      </header>
      <HeaderScroll />
    </>
  );
}
