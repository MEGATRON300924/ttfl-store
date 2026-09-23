import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Payouts",
  description: "Review and manage TTFL Store vendor payouts and payment records.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/payouts` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
