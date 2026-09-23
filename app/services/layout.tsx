import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Discover services offered by verified vendors on TTFL Store.",
  alternates: { canonical: `https://ttflstore.name.ng/services` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
