const SITE_URL = "https://ttflstore.name.ng";

type Crumb = { name: string; url: string };

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const jsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${SITE_URL}${item.url}` })) };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function ItemListJsonLd({ name, items }: { name: string; items: Array<{ name: string; url: string; image?: string }> }) {
  const jsonLd = { "@context": "https://schema.org", "@type": "ItemList", name, itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: `${SITE_URL}${item.url}`, ...(item.image ? { image: item.image } : {}) })) };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
