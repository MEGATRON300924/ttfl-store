import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Logs",
  description: "Review TTFL Store transactional email delivery logs and email events.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/email-logs` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
