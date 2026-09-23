import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Payouts",
  description: "View and manage TTFL Store vendor payouts, earnings, and payment history.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/payouts` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
