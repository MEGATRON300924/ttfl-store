import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flash Deals",
  description: "Shop limited-time flash deals and discounted products from TTFL Store sellers.",
  openGraph: { title: "Flash Deals | TTFL Store", description: "Limited-time discounts from TTFL Store sellers.", images: ["/ttflstore.png"] },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) { return children; }
