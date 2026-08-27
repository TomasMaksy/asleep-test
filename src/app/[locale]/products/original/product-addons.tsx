"use client";

import { ChevronRight, Plus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatMattPrice } from "@/lib/product-original-sizes";
import { staticImageUrl } from "@/lib/static-image-url";

type AddonItem = {
  id: string;
  title: string;
  description: string;
  size: string;
  price: number | null;
  compareAt: number | null;
  image: string;
  action: "add" | "link";
  href?: string;
};

export function ProductAddons() {
  const t = useTranslations("productOriginal.hero.addons");
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const items = t.raw("items") as AddonItem[];

  return (
    <div className="mb-7">
      <p className="mb-4 font-bold text-base text-brand-dark leading-snug">
        {t("heading")}
      </p>

      <ul className="flex flex-col">
        {items.map((item) => {
          const content = (
            <>
              <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface sm:size-20">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="80px"
                  src={staticImageUrl(item.image)}
                />
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-bold text-brand-dark text-sm leading-snug">
                  {item.title}
                </span>
                <span className="text-brand-dark/70 text-sm leading-snug">
                  {item.description}
                </span>
                {item.size ? (
                  <span className="text-brand-dark/55 text-sm leading-snug">
                    {item.size}
                  </span>
                ) : null}
                {item.price != null ? (
                  <span className="mt-0.5 flex items-center gap-2 text-sm">
                    {item.compareAt != null ? (
                      <span className="text-brand-dark/45 line-through">
                        {formatMattPrice(item.compareAt * 100)}
                      </span>
                    ) : null}
                    <span className="font-bold text-brand-dark">
                      {formatMattPrice(item.price * 100)}
                    </span>
                  </span>
                ) : null}
              </span>
            </>
          );

          if (item.action === "link") {
            return (
              <li
                className="border-grey border-b last:border-b-0"
                key={item.id}
              >
                <Link
                  className="flex items-center gap-4 py-3 transition-colors hover:bg-surface/60"
                  href={item.href ?? "/products/original"}
                >
                  {content}
                  <span className="flex size-10 shrink-0 items-center justify-center text-brand">
                    <ChevronRight className="size-5" strokeWidth={1.75} />
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li className="border-grey border-b last:border-b-0" key={item.id}>
              <div className="flex items-center gap-4 py-3">
                {content}
                <button
                  aria-label={t("addLabel", { name: item.title })}
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
                  onClick={() => {
                    addItem({
                      id: item.id,
                      name: item.title,
                      price: item.price ?? 0,
                      image: item.image,
                    });
                    openCart();
                  }}
                  type="button"
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
