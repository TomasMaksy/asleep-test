import type { Metadata } from "next";
import { CompareView } from "@/app/[locale]/compare/compare-view";

/**
 * Internal design/compare tool. Kept in the repo for later use, but blocked
 * from indexing (robots.txt + noindex) and omitted from the sitemap / llms.txt.
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
