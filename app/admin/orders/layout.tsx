import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Orders",
  description: "Manage customer orders, payments, fulfillment, and order status on TTFL Store.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/orders` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
