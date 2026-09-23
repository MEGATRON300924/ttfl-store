import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description: "Learn about TTFL Store trust, safety, marketplace standards, and buyer and vendor protection.",
  alternates: { canonical: `https://ttflstore.name.ng/trust` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
