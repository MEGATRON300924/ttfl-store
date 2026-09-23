import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Orders",
  description: "Manage customer orders, fulfillment, delivery status, and order details for your TTFL Store store.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/orders` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
