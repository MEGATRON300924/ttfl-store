import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Team Invitation",
  description: "Accept an invitation to join a TTFL Store vendor team.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/invite` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
