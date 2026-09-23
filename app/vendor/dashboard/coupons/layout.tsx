import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Coupons",
  description: "Create and manage discount coupons for your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/coupons` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
