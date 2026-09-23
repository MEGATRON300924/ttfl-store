import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Reviews",
  description: "Read customer reviews for a TTFL Store vendor storefront.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
