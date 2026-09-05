import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Plans & Pricing | TTFL Store",
  description: "Compare TTFL Store vendor plans, monthly prices, product limits, and marketplace commission rates.",
  alternates: { canonical: "https://ttflstore.name.ng/sell/pricing" },
  openGraph: {
    title: "Vendor Plans & Pricing | TTFL Store",
    description: "Compare TTFL Store vendor plans, monthly prices, product limits, and marketplace commission rates.",
    url: "https://ttflstore.name.ng/sell/pricing",
    siteName: "TTFL Store",
    type: "website",
  },
};

export default function VendorPricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
