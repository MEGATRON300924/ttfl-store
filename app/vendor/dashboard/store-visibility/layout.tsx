import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Visibility",
  description: "Manage the visibility and discoverability of your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/store-visibility` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
