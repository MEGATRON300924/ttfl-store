import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm Store Promotion",
  description: "Confirm a promotional campaign for your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/promote` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
