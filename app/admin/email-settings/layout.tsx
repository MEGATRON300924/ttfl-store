import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Settings",
  description: "Manage TTFL Store email configuration, provider status, and test notifications.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/email-settings` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
