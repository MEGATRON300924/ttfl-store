import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Notifications",
  description: "View important TTFL Store notifications and updates for your vendor account.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/vendor/dashboard/notifications` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
