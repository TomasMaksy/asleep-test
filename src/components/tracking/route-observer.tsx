"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useOriginalSizeStore } from "@/lib/product-original-size-store";
import { getMattressSize } from "@/lib/product-original-sizes";
import { trackClientEvent } from "@/lib/tracking/client/dispatcher";
import { asHttpUrl, currentTrackingUrl } from "@/lib/tracking/urls";

const ORIGINAL_PRODUCT_PATH = /^\/(?:lt|en)\/products\/original\/?$/;

export function TrackingRouteObserver() {
  const pathname = usePathname();
  const productName = useTranslations("productOriginal.hero")("subtitle");
  const previousPath = useRef("");
  const previousUrl = useRef("");

  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }

    const url = currentTrackingUrl();
    const referrer =
      previousUrl.current || asHttpUrl(document.referrer) || undefined;

    previousPath.current = pathname;
    previousUrl.current = url;

    trackClientEvent(
      "pageview",
      {
        page_title: document.title,
        referrer,
      },
      { source: "route" },
    );

    if (!ORIGINAL_PRODUCT_PATH.test(pathname)) {
      return;
    }

    const sizeId = useOriginalSizeStore.getState().sizeId;
    const size = getMattressSize(sizeId);
    trackClientEvent(
      "product_viewed",
      {
        currency: "EUR",
        value: size.originalCents / 100,
        items: [
          {
            item_id: `matt-original-${sizeId}`,
            item_name: productName,
            item_variant: size.label,
            price: size.originalCents / 100,
            quantity: 1,
          },
        ],
      },
      { source: "route" },
    );
  }, [pathname, productName]);

  return null;
}
