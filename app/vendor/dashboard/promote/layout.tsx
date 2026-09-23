import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promote Products",
  description: "Promote your TTFL Store products to reach more marketplace customers.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/promote` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
