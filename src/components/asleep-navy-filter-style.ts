"use client";

import { useEffect, useState } from "react";
import {
  asleepNavyFilterStyle,
  asleepNavyScrollFilterStyle,
} from "@/components/asleep-navy-filter";
import { needsHevcAlphaVideo } from "@/lib/transparent-video";

export function useAsleepNavyFilterStyle() {
  const [style, setStyle] = useState<typeof asleepNavyFilterStyle | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!needsHevcAlphaVideo()) {
      setStyle(asleepNavyFilterStyle);
    }
  }, []);

  return style;
}

export function useAsleepNavyScrollFilterStyle() {
  const [style, setStyle] = useState<
    typeof asleepNavyScrollFilterStyle | undefined
  >(undefined);

  useEffect(() => {
    if (!needsHevcAlphaVideo()) {
      setStyle(asleepNavyScrollFilterStyle);
    }
  }, []);

  return style;
}
