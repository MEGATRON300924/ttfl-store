import type { Metadata } from "next";
export const metadata: Metadata = { title: "Payment Confirmed", description: "Confirming your TTFL Store payment.", robots: { index: false, follow: false } };
export default function PaymentConfirmedLayout({ children }: { children: React.ReactNode }) { return children; }
