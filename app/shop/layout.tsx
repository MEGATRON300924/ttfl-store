import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop products from vendors across Nigeria on TTFL Store.",
  alternates: { canonical: `https://ttflstore.name.ng/shop` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
