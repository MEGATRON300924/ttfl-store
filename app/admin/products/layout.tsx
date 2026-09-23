import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Products",
  description: "Manage TTFL Store marketplace products, listings, inventory, and product moderation.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/products` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
