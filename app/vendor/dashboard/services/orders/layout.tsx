import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Orders",
  description: "Manage customer bookings and orders for services sold through TTFL Store.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/services/orders` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
