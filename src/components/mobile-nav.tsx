"use client";

import { Menu, X } from "lucide-react";
import { ConfiguratorLink } from "@/components/configurator/configurator-link";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type NavLink = {
  label: string;
  href: string;
  accent?: boolean;
};

const SHEET_ID = "mobile-nav";

function closeSheet() {
  document.getElementById(SHEET_ID)?.hidePopover();
}

export function MobileNav({
  links,
  solid,
  reviewsLabel,
  menuLabel,
}: {
  links: NavLink[];
  solid: boolean;
  reviewsLabel: string;
  menuLabel: string;
}) {
  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label="Open menu"
        className={cn(
          "flex size-10 cursor-pointer items-center justify-center rounded-full border duration-150 lg:hidden",
          solid
            ? "border-brand-dark/25 text-brand-dark"
            : "border-white/30 text-current group-hover:border-brand-dark/20 group-data-[scrolled=true]:border-brand-dark/20",
        )}
        popoverTarget={SHEET_ID}
        type="button"
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </button>

      <div
        className="mobile-nav-sheet z-[2000] text-brand-dark lg:hidden"
        id={SHEET_ID}
        popover="auto"
      >
        <div className="flex h-20 items-center justify-between border-brand-dark/10 border-b px-5">
          <p className="font-bold text-lg">{menuLabel}</p>
          <button
            aria-label="Close menu"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-dark/15"
            popoverTarget={SHEET_ID}
            popoverTargetAction="hide"
            type="button"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
          {links.map((link) => {
            const className = cn(
              "rounded-xl px-4 py-3 font-medium text-base",
              link.accent ? "text-red-600" : "text-brand-dark",
            );

            if (link.href === "/configurator") {
              return (
                <ConfiguratorLink
                  className={className}
                  key={link.label}
                  onClick={closeSheet}
                >
                  {link.label}
                </ConfiguratorLink>
              );
            }

            return (
              <Link
                className={className}
                href={link.href}
                key={link.label}
                onClick={closeSheet}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            className="rounded-xl px-4 py-3 font-medium text-base text-brand-dark"
            href="/reviews"
            onClick={closeSheet}
          >
            {reviewsLabel}
          </Link>
        </nav>
      </div>
    </>
  );
}
