import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Launches",
  description: "Manage product launches and upcoming listings on your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/launches` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
