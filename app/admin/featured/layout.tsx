import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Featured Listings",
  description: "Manage featured and promoted TTFL Store products and storefront placements.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/featured` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
