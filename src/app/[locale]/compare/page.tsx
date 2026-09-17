import type { Metadata } from "next";
import { CompareView } from "@/app/[locale]/compare/compare-view";

/**
 * Internal design/compare tool. Crawlable with noindex (so Google can see the
 * robots meta) and omitted from the sitemap / llms.txt — not Disallow'd.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  alternates: {
    canonical: undefined,
  },
};

export default function ComparePage() {
  return <CompareView />;
}
