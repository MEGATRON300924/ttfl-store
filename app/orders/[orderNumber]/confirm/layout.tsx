import type { Metadata } from "next";
export const metadata: Metadata = { title: "Order Confirmation", description: "Confirming your TTFL Store order payment.", robots: { index: false, follow: false } };
export default function OrderConfirmLayout({ children }: { children: React.ReactNode }) { return children; }
