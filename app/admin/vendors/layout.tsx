import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Vendors",
  description: "Manage TTFL Store vendors, seller accounts, storefronts, and vendor access.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/vendors` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
