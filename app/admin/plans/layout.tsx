import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Plans",
  description: "Manage TTFL Store vendor plans, subscriptions, and marketplace plan settings.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/plans` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
