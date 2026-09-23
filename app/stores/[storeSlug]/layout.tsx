import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  return {
    title: `${decodeURIComponent(storeSlug)} Store`,
    description: `View the ${decodeURIComponent(storeSlug)} storefront, products, and reviews on TTFL Store.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `https://ttflstore.name.ng/store/${encodeURIComponent(storeSlug)}` },
  };
}

export default function LegacyStoreLayout({ children }: { children: React.ReactNode }) { return children; }
