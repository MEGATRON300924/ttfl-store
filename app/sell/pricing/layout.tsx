import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vendor Plans & Pricing", description: "Compare TTFL Store vendor plans, monthly prices, product limits, and marketplace commission rates.", alternates: { canonical: "https://www.ttflstore.name.ng/sell/pricing" }, openGraph: { title: "Vendor Plans & Pricing | TTFL Store", description: "Compare TTFL Store vendor plans and marketplace fees.", url: "https://www.ttflstore.name.ng/sell/pricing", siteName: "TTFL Store", type: "website", images: [{ url: "/ttflstore.png", alt: "TTFL Store vendor pricing" }] } };
export default function VendorPricingLayout({ children }: { children: React.ReactNode }) { return children; }
