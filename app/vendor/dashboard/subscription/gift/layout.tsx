import type { Metadata } from "next";
export const metadata: Metadata = { title: "Your gifted plan", description: "Review your TTFL Store gifted vendor plan.", robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
