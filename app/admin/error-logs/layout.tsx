import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error Logs",
  description: "Search TTFL Store error codes and inspect system audit details for customer support.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin/error-logs` },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
