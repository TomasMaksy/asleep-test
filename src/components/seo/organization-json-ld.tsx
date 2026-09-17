import { getSiteUrl } from "@/lib/site-url";

/** Sitewide Organization + WebSite JSON-LD for rich results. */
export function OrganizationJsonLd() {
  const site = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: "asleep",
        url: site,
        logo: `${site}/web-app-manifest-512x512.png`,
        email: "info@asleep.lt",
        telephone: "+37061467580",
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
