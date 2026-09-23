import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account",
  description: "Create a TTFL Store account and start shopping, saving products, earning rewards, and more.",
  alternates: { canonical: `https://ttflstore.name.ng/register` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
