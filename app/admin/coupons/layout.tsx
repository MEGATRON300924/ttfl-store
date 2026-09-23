import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Coupons",
  description: "Create and manage TTFL Store discount coupons and promotional codes.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/coupons` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
