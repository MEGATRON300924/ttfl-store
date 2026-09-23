import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Team",
  description: "Manage staff and team access for your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/team` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
