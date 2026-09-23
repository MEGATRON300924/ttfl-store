import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Store Profile",
  description: "Preview and manage the public profile of your TTFL Store vendor account.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/public-profile` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
