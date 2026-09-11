import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Centre | Vendor Dashboard | TTFL Store",
  description: "Create, manage, and measure TTFL Store advertising campaigns.",
  robots: { index: false, follow: false },
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
