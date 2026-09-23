import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TTFL Store App",
  description: "Explore the TTFL Store mobile shopping experience and marketplace app.",
  alternates: { canonical: `https://ttflstore.name.ng/app` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
