import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promote Store",
  description: "Promote your TTFL Store storefront and reach more customers.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/promote-store` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
