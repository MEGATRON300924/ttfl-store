import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your TTFL Store account.",
  alternates: { canonical: `https://ttflstore.name.ng/reset-password` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
