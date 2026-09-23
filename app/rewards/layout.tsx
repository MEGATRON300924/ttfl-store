import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TTFL Rewards",
  description: "View your TTFL Rewards points, level, earning activity, and eligible rewards.",
  alternates: { canonical: `https://ttflstore.name.ng/rewards` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
