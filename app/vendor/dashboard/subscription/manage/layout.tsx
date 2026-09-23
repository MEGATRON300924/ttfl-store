import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Subscription",
  description: "Manage your TTFL Store vendor subscription and plan.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/subscription/manage` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
