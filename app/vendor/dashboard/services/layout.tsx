import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Services",
  description: "Manage services offered through your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/services` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
