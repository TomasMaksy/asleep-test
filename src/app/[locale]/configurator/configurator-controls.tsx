"use client";

import { AnimatedRadioIndicator } from "@/components/product/animated-radio-indicator";
import {
  FIRMNESS_LEVELS,
  type Firmness,
  MAX_PREFERENCE,
  MIN_PREFERENCE,
} from "@/lib/configurator";
import type { MattressSizeId } from "@/lib/product-original-sizes";
import { cn } from "@/lib/utils";

const THUMB_WIDTH_PX = 48;

function SliderChevrons() {
  return (
    <svg
      aria-hidden="true"
      className="h-2.5 w-[26px]"
      fill="none"
      viewBox="0 0 26 10"
    >
      <path
        d="M21 8.64941L24.7665 4.88309L21 1.11663"
        stroke="#2B2D41"
        strokeLinecap="round"
        strokeWidth="1.208"
      />
      <path
        d="M4.76562 1.11621L0.999163 4.88253L4.76562 8.649"
        stroke="#2B2D41"
        strokeLinecap="round"
        strokeWidth="1.208"
      />
    </svg>
  );
}

function ConfiguratorSlider({
  disabled,
  id,
  max,
  min,
  onCommit,
  onValueChange,
  rangeBar,
  value,
  valueSuffix,
}: {
  disabled?: boolean;
  id: string;
  max: number;
  min: number;
  onCommit: () => void;
  onValueChange: (value: number) => void;
  rangeBar?: boolean;
  value: number;
  valueSuffix?: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cn(
        "relative flex h-8 w-full min-w-0 touch-none select-none items-center",
        valueSuffix && "mt-6",
      )}
    >
      <div className="relative z-10 h-0.5 w-full rounded-full bg-grey" />
      {rangeBar ? (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-[15] h-[14px] w-[175px] max-w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-grey" />
      ) : null}
      <div
        className="pointer-events-none absolute z-20 flex -translate-x-1/2 flex-col items-center"
        style={{
          left: `calc(${percent / 100} * (100% - ${THUMB_WIDTH_PX}px) + ${THUMB_WIDTH_PX / 2}px)`,
        }}
      >
        {valueSuffix ? (
          <span className="absolute -top-6 text-brand-dark text-sm tabular-nums">
            {value}
            {valueSuffix}
          </span>
        ) : null}
        <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-[40px] border border-brand bg-white">
          <SliderChevrons />
        </div>
      </div>
      <input
        className="configurator-range"
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        onChange={(event) => onValueChange(Number(event.currentTarget.value))}
        onKeyUp={(event) => {
          onValueChange(Number(event.currentTarget.value));
          onCommit();
        }}
        onPointerUp={(event) => {
          onValueChange(Number(event.currentTarget.value));
          onCommit();
        }}
        type="range"
        value={value}
      />
    </div>
  );
}

export function ConfiguratorRangeField({
  disabled,
  id,
  label,
  max,
  min,
  onCommit,
  onValueChange,
  suffix,
  value,
}: {
  disabled?: boolean;
  id: string;
  label: string;
  max: number;
  min: number;
  onCommit: () => void;
  onValueChange: (value: number) => void;
  suffix?: string;
  value: number;
}) {
  return (
    <div className="min-w-0">
      {label ? (
        <label className="mb-2 block text-brand-dark text-sm" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <ConfiguratorSlider
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        onCommit={onCommit}
        onValueChange={onValueChange}
        value={value}
        valueSuffix={suffix}
      />
    </div>
  );
}

export function ConfiguratorPreferenceField({
  disabled,
  firmLabel,
  id,
  mediumLabel,
  onCommit,
  onValueChange,
  perfectFor,
  softLabel,
  value,
}: {
  disabled?: boolean;
  firmLabel: string;
  id: string;
  mediumLabel: string;
  onCommit: () => void;
  onValueChange: (value: number) => void;
  perfectFor: string;
  softLabel: string;
  value: number;
}) {
  return (
    <div className="relative min-w-0 pb-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-brand-dark/70 text-xs">{softLabel}</p>
        <p className="text-brand-dark/70 text-xs">{mediumLabel}</p>
        <p className="text-brand-dark/70 text-xs">{firmLabel}</p>
      </div>
      <ConfiguratorSlider
        disabled={disabled}
        id={id}
        max={MAX_PREFERENCE}
        min={MIN_PREFERENCE}
        onCommit={onCommit}
        onValueChange={onValueChange}
        rangeBar
        value={value}
      />
      <p className="mt-3 text-center text-brand-dark/70 text-xs">
        {perfectFor}
      </p>
    </div>
  );
}

export function ConfiguratorFirmnessScale({
  active,
  dimmed,
  labels,
  levels = FIRMNESS_LEVELS,
  mirror,
}: {
  active: Firmness;
  dimmed?: boolean;
  labels: string[];
  levels?: readonly Firmness[];
  mirror?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col gap-2 duration-300 md:gap-6",
        dimmed && "opacity-40",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-[10px] -z-10 h-[calc(100%-20px)] border-white border-r",
          mirror ? "right-[3px]" : "left-[3px]",
        )}
      />
      {levels.map((level, index) => {
        const selected = active === level;
        const label = labels[index] ?? "";
        return (
          <div
            className={cn(
              "flex items-center gap-1 md:gap-3",
              mirror && "flex-row-reverse",
            )}
            key={level}
          >
            <div
              className={cn(
                "size-2 rounded-full border border-white duration-300",
                selected ? "scale-125 bg-white" : "bg-[#1D4A9D]",
              )}
            />
            <p
              className={cn(
                "font-heading text-[12px] text-white opacity-80 duration-300 md:text-base",
                selected && "!font-bold !opacity-100",
              )}
            >
              {mirror ? `${label} ${level}` : `${level} ${label}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

type SizeOption = {
  id: MattressSizeId;
  label: string;
};

export function ConfiguratorSizeList({
  onSelect,
  selectedId,
  sizes,
}: {
  onSelect: (id: MattressSizeId) => void;
  selectedId: MattressSizeId;
  sizes: readonly SizeOption[];
}) {
  return (
    <div className="flex flex-col">
      {sizes.map((entry) => {
        const selected = entry.id === selectedId;
        return (
          <label
            className="flex cursor-pointer items-center gap-4 border-brand-dark/10 border-b py-4 last:border-b-0"
            key={entry.id}
          >
            <input
              checked={selected}
              className="sr-only"
              name="configurator-size"
              onChange={() => onSelect(entry.id)}
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

export function ConfiguratorCategoryToggle({
  category,
  doubleLabel,
  onChange,
  singleLabel,
}: {
  category: "single" | "double";
  doubleLabel: string;
  onChange: (category: "single" | "double") => void;
  singleLabel: string;
}) {
  return (
    <fieldset
      aria-label={`${singleLabel} / ${doubleLabel}`}
      className="relative m-0 flex min-w-0 rounded-full border border-brand-dark/10 p-1"
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          category === "double" && "translate-x-full",
        )}
      />
      <button
        aria-pressed={category === "single"}
        className={cn(
          "relative z-10 flex-1 rounded-full py-2.5 font-semibold text-sm transition-colors duration-300",
          category === "single"
            ? "text-white"
            : "text-brand-dark hover:text-brand-dark/70",
        )}
        onClick={() => onChange("single")}
        type="button"
      >
        {singleLabel}
      </button>
      <button
        aria-pressed={category === "double"}
        className={cn(
          "relative z-10 flex-1 rounded-full py-2.5 font-semibold text-sm transition-colors duration-300",
          category === "double"
            ? "text-white"
            : "text-brand-dark hover:text-brand-dark/70",
        )}
        onClick={() => onChange("double")}
        type="button"
      >
        {doubleLabel}
      </button>
    </fieldset>
  );
}
