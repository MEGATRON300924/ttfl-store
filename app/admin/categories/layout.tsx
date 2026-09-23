import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Categories",
  description: "Manage TTFL Store marketplace categories and category structure.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/categories` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
