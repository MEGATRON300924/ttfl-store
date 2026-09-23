import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TTFL Store Partners",
  description: "Partner with TTFL Store to host events, opportunities, promotions, and marketplace initiatives.",
  alternates: { canonical: `https://ttflstore.name.ng/partners` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
