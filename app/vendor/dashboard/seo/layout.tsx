import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store SEO",
  description: "Manage search engine optimization settings for your TTFL Store storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/seo` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
