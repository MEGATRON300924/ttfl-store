import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Support Reports",
  description: "View and manage your TTFL Store support reports and submitted issues.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
