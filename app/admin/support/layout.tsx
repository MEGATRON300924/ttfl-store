import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Support",
  description: "Manage TTFL Store customer support tickets and support conversations.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/support` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
