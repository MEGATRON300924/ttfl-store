import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Login",
  description: "Log in to your TTFL Store vendor account and manage your storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/login` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
