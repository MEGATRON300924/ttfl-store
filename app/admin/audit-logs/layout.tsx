import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Review TTFL Store administrative audit logs and recorded system activity.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/audit-logs` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
