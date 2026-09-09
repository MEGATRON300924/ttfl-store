const SITE_URL = "https://ttflstore.name.ng";

export function SiteStructuredData() {
  const graph = [
    {
      "@type": "OnlineStore",
      "@id": `${SITE_URL}/#organization`,
      name: "TTFL Store",
      alternateName: "The Tron Forge Limited Marketplace",
      url: SITE_URL,
      logo: `${SITE_URL}/ttflstore.png`,
      image: `${SITE_URL}/ttflstore.png`,
      description: "TTFL Store is an online marketplace connecting buyers with vendors across Nigeria.",
      parentOrganization: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#parent-organization`,
        name: "The Tron Forge Limited",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "TTFL Store",
      description: "Buy and sell with vendors on TTFL Store.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-NG",
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
