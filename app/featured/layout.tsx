import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Featured Products",
  description: "Explore featured products and promoted listings on TTFL Store.",
  alternates: { canonical: `https://ttflstore.name.ng/featured` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
