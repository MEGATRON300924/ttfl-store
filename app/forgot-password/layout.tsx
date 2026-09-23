import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your TTFL Store account password securely.",
  alternates: { canonical: `https://ttflstore.name.ng/forgot-password` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
