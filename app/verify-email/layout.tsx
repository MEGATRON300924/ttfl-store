import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address for your TTFL Store account.",
  alternates: { canonical: `https://ttflstore.name.ng/verify-email` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
