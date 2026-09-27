import type { Metadata } from "next";

const SITE_URL = "https://ttflstore.name.ng";

export const metadata: Metadata = {
  title: { absolute: "Vendor Login | TTFL Store" },
  description: "Log in to your TTFL Store vendor account and manage your storefront.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/vendor/login` },
  openGraph: {
    type: "website",
    siteName: "TTFL Store",
    title: "Vendor Login | TTFL Store",
    description: "Log in to your TTFL Store vendor account and manage your storefront.",
    url: `${SITE_URL}/vendor/login`,
    locale: "en_NG",
  },
  twitter: {
    card: "summary",
    title: "Vendor Login | TTFL Store",
    description: "Log in to your TTFL Store vendor account and manage your storefront.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
