import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Events",
  description: "Manage TTFL Store partner events, virtual trade fairs, event plans, and publishing.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/events` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
