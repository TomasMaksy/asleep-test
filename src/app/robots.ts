import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  // Checkout/compare stay crawlable so Google can see their noindex meta tags.
  // They are omitted from the sitemap instead of Disallow (robots.txt hides noindex).
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
