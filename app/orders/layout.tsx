import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and manage your TTFL Store orders, payment status, delivery progress, and order details.",
  alternates: { canonical: `https://ttflstore.name.ng/orders` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
