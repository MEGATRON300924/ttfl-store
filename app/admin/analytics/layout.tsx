import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Analytics",
  description: "View TTFL Store marketplace analytics, sales metrics, customer activity, and performance.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/analytics` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
