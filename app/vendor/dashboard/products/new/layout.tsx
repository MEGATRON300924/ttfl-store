import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Product",
  description: "Create a new product listing for your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/products/new` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
