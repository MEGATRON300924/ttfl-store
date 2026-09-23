import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TTFL Store",
  description: "Learn about TTFL Store, The Tron Forge Limited, our marketplace mission, and how we help buyers and vendors across Nigeria.",
  alternates: { canonical: `https://ttflstore.name.ng/about` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
