import {
  buildMerchantReturnPolicy,
  buildOrganizationShippingService,
} from "@/lib/merchant-policies";
import { getSiteUrl } from "@/lib/site-url";

/** Sitewide OnlineStore + WebSite JSON-LD for rich results / merchant panel. */
export function OrganizationJsonLd() {
  const site = getSiteUrl();
  const returnPolicy = buildMerchantReturnPolicy(site);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": `${site}/#organization`,
        name: "asleep",
        url: site,
        logo: `${site}/web-app-manifest-512x512.png`,
        email: "info@asleep.lt",
        telephone: "+37061467580",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Vilnius",
          addressCountry: "LT",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "info@asleep.lt",
          telephone: "+37061467580",
        },
        hasShippingService: buildOrganizationShippingService(),
        hasMerchantReturnPolicy: returnPolicy,
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        url: site,
        name: "asleep",
        publisher: { "@id": `${site}/#organization` },
        inLanguage: ["lt-LT", "en"],
      },
    ],
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
