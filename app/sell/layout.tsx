import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell on TTFL Store",
  description: "Apply to become a TTFL Store vendor and create your own online storefront for customers in Nigeria.",
  alternates: { canonical: "https://ttflstore.name.ng/sell" },
  openGraph: { title: "Sell on TTFL Store", description: "Apply to become a TTFL Store vendor and create your own online storefront.", url: "https://ttflstore.name.ng/sell", siteName: "TTFL Store", type: "website" },
  robots: { index: true, follow: true },
};

export default function SellLayout({ children }: { children: React.ReactNode }) { return children; }
