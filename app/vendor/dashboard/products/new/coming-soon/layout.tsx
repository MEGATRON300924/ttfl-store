import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon Products",
  description: "Prepare an upcoming product launch for your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/products/new/coming-soon` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
