import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review products in your TTFL Store shopping cart before checkout.",
  alternates: { canonical: `https://ttflstore.name.ng/cart` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
