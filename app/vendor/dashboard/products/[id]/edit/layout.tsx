import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit product details, pricing, inventory, media, and listing information.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/products` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
