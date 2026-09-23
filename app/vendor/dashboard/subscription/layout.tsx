import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Subscription",
  description: "Manage your TTFL Store vendor plan and subscription.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/subscription` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
