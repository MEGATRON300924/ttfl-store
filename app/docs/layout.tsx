import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Read TTFL Store documentation, guides, and technical information.",
  alternates: { canonical: `https://ttflstore.name.ng/docs` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
