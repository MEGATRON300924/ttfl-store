import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse products available from vendors on TTFL Store.",
  alternates: { canonical: `https://ttflstore.name.ng/products` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
