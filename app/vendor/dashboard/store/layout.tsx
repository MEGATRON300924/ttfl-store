import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Store",
  description: "Manage and preview your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/store` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
