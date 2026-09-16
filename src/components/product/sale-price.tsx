import { formatMattPrice } from "@/lib/product-original-sizes";
import { cn } from "@/lib/utils";

type SalePriceProps = {
  compareCents: number;
  saleCents: number;
  badge?: string;
  className?: string;
  saleClassName?: string;
};

export function SalePrice({
  compareCents,
  saleCents,
  badge,
  className,
  saleClassName,
}: SalePriceProps) {
  const onSale = saleCents < compareCents;

  if (!onSale) {
    return (
      <span className={cn("font-bold text-brand-dark", saleClassName)}>
        {formatMattPrice(saleCents)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="text-[0.92em] text-brand-dark/45 line-through decoration-brand-dark/35"
      >
        {formatMattPrice(compareCents)}
      </span>
      <span className={cn("font-bold text-brand-dark", saleClassName)}>
        {formatMattPrice(saleCents)}
      </span>
      {badge ? <SaleBadge>{badge}</SaleBadge> : null}
    </span>
  );
}

export function SaleBadge({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-[#e11d48] px-2.5 py-1 font-bold text-[13px] text-white leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}
