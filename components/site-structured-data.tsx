const SITE_URL = "https://ttflstore.name.ng";
export function SiteStructuredData() {
  const organizationId = `${SITE_URL}/#organization`;
  const graph = [
    { "@type": "Organization", "@id": `${SITE_URL}/#parent-organization`, name: "The Tron Forge Limited", url: "https://thetronforge.name.ng", description: "The company behind TTFL Store and its technology ecosystem." },
    { "@type": "OnlineStore", "@id": organizationId, name: "TTFL Store", alternateName: "The Tron Forge Limited Marketplace", url: SITE_URL, logo: { "@type": "ImageObject", "@id": `${SITE_URL}/#logo`, url: `${SITE_URL}/ttflstore.png`, width: 1200, height: 630 }, image: { "@id": `${SITE_URL}/#logo` }, description: "TTFL Store is an online marketplace connecting buyers with vendors across Nigeria.", foundingDate: "2025-09-01", parentOrganization: { "@id": `${SITE_URL}/#parent-organization` }, areaServed: { "@type": "Country", name: "Nigeria" }, brand: { "@type": "Brand", name: "TTFL Store" }, contactPoint: { "@type": "ContactPoint", contactType: "customer service", url: `${SITE_URL}/contact` } },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "TTFL Store", description: "Buy and sell with vendors on TTFL Store.", publisher: { "@id": organizationId }, inLanguage: "en-NG", potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" } },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }} />;
}
