import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flash Deals",
  description: "Manage flash deals and limited-time offers for your TTFL Store products.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/flash-deals` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
