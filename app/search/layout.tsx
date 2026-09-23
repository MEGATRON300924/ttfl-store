import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Products & Stores",
  description: "Search TTFL Store for products, stores, categories, and marketplace listings.",
  alternates: { canonical: `https://ttflstore.name.ng/search` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
