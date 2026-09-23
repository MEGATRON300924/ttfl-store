import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm Subscription",
  description: "Confirm your TTFL Store vendor subscription and payment.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/subscription` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
