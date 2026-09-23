import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View and manage products you have saved to your TTFL Store wishlist.",
  alternates: { canonical: `https://ttflstore.name.ng/wishlist` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
