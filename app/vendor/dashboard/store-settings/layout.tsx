import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Settings",
  description: "Manage your TTFL Store storefront settings, contact details, branding, and configuration.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/store-settings` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
