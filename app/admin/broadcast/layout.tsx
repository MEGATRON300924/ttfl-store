import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Broadcasts",
  description: "Create and manage TTFL Store announcements and customer broadcasts.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/broadcast` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
