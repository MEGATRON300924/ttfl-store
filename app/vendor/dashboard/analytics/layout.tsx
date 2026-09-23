import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Analytics",
  description: "View sales, product, store, and customer analytics for your TTFL Store business.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/analytics` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
