import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Configure TTFL Store marketplace, platform, notification, and administrative settings.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/settings` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
