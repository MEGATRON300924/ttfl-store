import type { Metadata } from "next";
export const metadata: Metadata = { title: "Report a Problem", description: "Report a product, order, seller or marketplace problem to TTFL Store support.", openGraph: { title: "Report a Problem | TTFL Store", description: "Send a marketplace problem to TTFL Store support.", images: ["/ttflstore.png"] } };
export default function ReportLayout({ children }: { children: React.ReactNode }) { return children; }
