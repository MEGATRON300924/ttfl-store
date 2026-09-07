"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";

export default function PaymentConfirmedPage() {
  const searchParams = useSearchParams();
  const cart = useCart();
  const [state, setState] = useState<"checking" | "success" | "failed">("checking");
  const [orderNumber, setOrderNumber] = useState("");
  useEffect(() => { const reference = searchParams.get("reference") ?? searchParams.get("trxref"); if (!reference) { setState("failed"); return; } api.get<{ order: { paymentStatus: string; orderNumber: string } }>(`/api/orders/verify/${reference}`).then(({ order }) => { if (order.paymentStatus === "PAID") { setOrderNumber(order.orderNumber); cart.clear(); setState("success"); } else setState("failed"); }).catch(() => setState("failed")); }, [searchParams]);
  return <main className="shell py-16 text-center">{state === "checking" && <><Loader2 className="mx-auto h-10 w-10 animate-spin text-graphite-400"/><h1 className="mt-4 text-xl font-bold">Confirming payment…</h1><p className="mt-2 text-sm text-graphite-600">We are securely checking the Paystack transaction.</p></>}{state === "success" && <><CheckCircle2 className="mx-auto h-12 w-12 text-verified-600"/><h1 className="mt-4 text-xl font-bold text-graphite-900">Payment confirmed</h1><p className="mt-2 text-sm text-graphite-600">Your payment was confirmed successfully. Order <span className="font-mono">{orderNumber}</span> is now being processed.</p><div className="mt-6 flex justify-center gap-3"><Link href="/account" className="rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white">View order</Link><Link href="/" className="rounded-card border border-graphite-200 px-5 py-2.5 text-sm font-semibold">Continue shopping</Link></div></>}{state === "failed" && <><XCircle className="mx-auto h-12 w-12 text-ember-600"/><h1 className="mt-4 text-xl font-bold text-graphite-900">Payment could not be confirmed</h1><p className="mt-2 text-sm text-graphite-600">If your account was charged, please contact support with your payment reference.</p><Link href="/support" className="mt-6 inline-block rounded-card bg-graphite-900 px-5 py-2.5 text-sm font-semibold text-white">Contact support</Link></>}</main>;
}
