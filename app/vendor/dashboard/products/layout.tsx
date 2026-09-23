import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Products",
  description: "Manage products, inventory, listings, and product information in your TTFL Store store.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/products` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
