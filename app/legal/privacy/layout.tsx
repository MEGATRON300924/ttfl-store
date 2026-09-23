import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the TTFL Store Privacy Policy and learn how information is handled.",
  alternates: { canonical: `https://ttflstore.name.ng/legal/privacy` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
