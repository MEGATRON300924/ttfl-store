import type { Metadata } from "next";

const SITE_URL = "https://ttflstore.name.ng";

export const metadata: Metadata = {
  title: { absolute: "TTFL Store Error Code Checker" },
  description:
    "Search TTFL Store error codes, understand what they mean, and copy an error code for support.",
  alternates: { canonical: `${SITE_URL}/error-codes` },
  openGraph: {
    type: "website",
    siteName: "TTFL Store",
    title: "TTFL Store Error Code Checker",
    description:
      "Search TTFL Store error codes, understand what they mean, and copy an error code for support.",
    url: `${SITE_URL}/error-codes`,
    locale: "en_NG",
  },
  twitter: {
    card: "summary",
    title: "TTFL Store Error Code Checker",
    description:
      "Search TTFL Store error codes, understand what they mean, and copy an error code for support.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
