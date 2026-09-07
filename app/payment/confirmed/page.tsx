import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentConfirmedView from "./view";

export const metadata: Metadata = { title: "Payment Confirmed", description: "Securely confirm your TTFL Store Paystack payment.", robots: { index: false, follow: false } };

export default function PaymentConfirmedPage() { return <Suspense fallback={<main className="shell py-16 text-center"><p className="text-sm text-graphite-600">Confirming payment…</p></main>}><PaymentConfirmedView /></Suspense>; }
