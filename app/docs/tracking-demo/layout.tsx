import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Tracking Demo",
  description: "Explore the TTFL Store order tracking demonstration.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
