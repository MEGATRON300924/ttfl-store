import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Advertising",
  description: "Create and manage advertising campaigns for your TTFL Store products.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/ads` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
