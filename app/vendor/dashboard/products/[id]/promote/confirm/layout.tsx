import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm Product Promotion",
  description: "Confirm a promotional campaign for your TTFL Store product.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/products` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
