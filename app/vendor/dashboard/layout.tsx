import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your TTFL Store store, products, orders, services, promotions, payouts, analytics, and team.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
