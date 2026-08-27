"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Mode = "split" | "overlay" | "difference";

const ORIGINAL = "https://www.mattsleeps.com/en";

export function CompareView({ locale }: { locale: Locale }) {
  const previewPath = `/${locale}`;
  const [mode, setMode] = useState<Mode>("split");
  const [opacity, setOpacity] = useState(50);
  const [width, setWidth] = useState(1440);

  return (
    <div className="flex h-dvh flex-col bg-neutral-950 text-white">
      <div className="flex flex-wrap items-center gap-3 border-neutral-800 border-b px-4 py-3">
        <p className="mr-4 font-bold font-heading">Compare</p>
        {(["split", "overlay", "difference"] as const).map((item) => (
          <button
            className={cn(
              "rounded-full px-3 py-1 text-sm",
              mode === item ? "bg-white text-black" : "bg-white/10",
            )}
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            {item}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          Width
          <input
            className="w-24 rounded bg-white/10 px-2 py-1"
            max={1920}
            min={375}
            onChange={(event) => setWidth(Number(event.target.value))}
            type="number"
            value={width}
          />
        </label>
        {mode !== "split" ? (
          <label className="flex items-center gap-2 text-sm">
            Ours {opacity}%
            <input
              max={100}
              min={0}
              onChange={(event) => setOpacity(Number(event.target.value))}
              type="range"
              value={opacity}
            />
          </label>
        ) : null}
        <a
          className="rounded-full bg-white/10 px-3 py-1 text-sm"
          href={ORIGINAL}
          rel="noreferrer"
          target="_blank"
        >
          Open original
        </a>
        <a
          className="rounded-full bg-white/10 px-3 py-1 text-sm"
          href={previewPath}
        >
          Open ours
        </a>
      </div>

      {mode === "split" ? (
        <div className="grid min-h-0 flex-1 grid-cols-2">
          <Frame
            label="Original"
            src="/reference/original-full.png"
            width={width}
          />
          <Frame iframe label="Ours" src={previewPath} width={width} />
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-auto bg-neutral-900">
          <div className="relative mx-auto" style={{ width }}>
            <Image
              alt="Original"
              className="block h-auto w-full"
              height={8561}
              src="/reference/original-full.png"
              unoptimized
              width={1440}
            />
            <iframe
              className={cn(
                "absolute inset-0 h-full w-full border-0",
                mode === "difference" && "mix-blend-difference",
              )}
              src={previewPath}
              style={{ opacity: opacity / 100 }}
              title="Ours"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Frame({
  label,
  src,
  iframe,
  width,
}: {
  label: string;
  src: string;
  iframe?: boolean;
  width: number;
}) {
  return (
    <div className="flex min-h-0 flex-col border-neutral-800 border-r">
      <p className="border-neutral-800 border-b px-3 py-2 text-white/60 text-xs uppercase tracking-wide">
        {label}
      </p>
      <div className="min-h-0 flex-1 overflow-auto bg-neutral-900">
        <div className="mx-auto" style={{ width }}>
          {iframe ? (
            <iframe
              className="h-[9000px] w-full border-0 bg-white"
              src={src}
              title={label}
            />
          ) : (
            <Image
              alt={label}
              className="block h-auto w-full"
              height={8561}
              src={src}
              unoptimized
              width={1440}
            />
          )}
        </div>
      </div>
    </div>
  );
}
