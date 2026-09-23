import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stores",
  description: "Browse TTFL Store vendor stores and discover products from marketplace sellers.",
  alternates: { canonical: `https://ttflstore.name.ng/stores` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
