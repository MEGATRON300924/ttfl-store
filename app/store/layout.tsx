import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storefronts",
  description: "Explore vendor storefronts and products on TTFL Store.",
  alternates: { canonical: `https://ttflstore.name.ng/store` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
