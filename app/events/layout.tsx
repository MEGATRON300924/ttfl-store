import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Opportunities",
  description: "Discover upcoming virtual trade fairs, partner events, and marketplace opportunities on TTFL Store.",
  alternates: { canonical: `https://ttflstore.name.ng/events` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
