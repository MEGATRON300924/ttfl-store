import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report an Issue",
  description: "Report a TTFL Store issue and include an error code so support can investigate it.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
