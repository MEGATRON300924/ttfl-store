import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description: "Join and manage the TTFL Store affiliate program, referrals, commissions, and affiliate activity.",
  alternates: { canonical: `https://ttflstore.name.ng/affiliate` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
