import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your TTFL Store account to shop, manage orders, access rewards, or manage your store.",
  alternates: { canonical: `https://ttflstore.name.ng/login` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
