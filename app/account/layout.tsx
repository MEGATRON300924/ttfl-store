import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | TTFL Store",
  description: "Manage your TTFL Store account, orders, addresses, wishlist, and profile settings.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
