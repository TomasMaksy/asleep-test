"use client";

import { useEffect, useRef } from "react";
import { AnimatedRadioIndicator } from "@/components/product/animated-radio-indicator";
import type { MattressSizeId } from "@/lib/product-original-sizes";

const CLOSE_DELAY_MS = 280;

type SizeOption = {
  id: MattressSizeId;
  label: string;
};

type ProductSizeRadioListProps = {
  sizes: readonly SizeOption[];
  selectedId: MattressSizeId;
  onSelect: (id: MattressSizeId) => void;
  onSelectionSettled: () => void;
};

export function ProductSizeRadioList({
  sizes,
  selectedId,
  onSelect,
  onSelectionSettled,
}: ProductSizeRadioListProps) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function handleSelect(id: MattressSizeId) {
    onSelect(id);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      onSelectionSettled();
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }

  return (
    <div className="flex flex-col">
      {sizes.map((entry) => {
        const selected = entry.id === selectedId;

        return (
          <label
            className="flex cursor-pointer items-center gap-4 border-brand-dark/10 border-b py-4"
            key={entry.id}
          >
            <input
              checked={selected}
              className="sr-only"
              name="mattress-size"
              onChange={() => handleSelect(entry.id)}
              type="radio"
              value={entry.id}
            />
            <AnimatedRadioIndicator selected={selected} />
            <span className="font-medium text-brand-dark text-sm">
              {entry.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
