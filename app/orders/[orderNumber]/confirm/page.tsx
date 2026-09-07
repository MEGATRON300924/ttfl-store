import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmView } from "./confirm-view";

export const metadata: Metadata = { title: "Order Confirmation", description: "Confirm your TTFL Store payment and view your order status.", robots: { index: false, follow: false } };

export default function OrderConfirmPage() { return <Suspense fallback={<main className="shell py-16 text-center"><p className="text-sm text-graphite-600">Confirming your order…</p></main>}><OrderConfirmView /></Suspense>; }
