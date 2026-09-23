import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Rewards",
  description: "Manage TTFL Rewards settings, points, levels, and reward activity.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/rewards` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
