import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the TTFL Store Terms of Service and marketplace rules.",
  alternates: { canonical: `https://ttflstore.name.ng/legal/terms` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
