import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Waitlists",
  description: "Manage TTFL Store product and launch waitlists.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/waitlists` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
