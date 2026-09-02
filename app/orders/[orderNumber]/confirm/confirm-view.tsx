"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";
import type { ApiOrder } from "@/lib/api-types";
import { getStoredAffiliateCode } from "@/components/affiliate-tracker";

export function OrderConfirmView() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const cart = useCart();
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");
  const [order, setOrder] = useState<ApiOrder | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    if (!reference) {
      setStatus("failed");
      return;
    }

    api.get<{ order: ApiOrder }>(`/api/orders/verify/${reference}`)
      .then(async ({ order }) => {
        setOrder(order);
        setStatus(order.paymentStatus === "PAID" ? "success" : "failed");
        if (order.paymentStatus === "PAID") {
          cart.clear();
          const code = getStoredAffiliateCode();
          if (code) {
            try {
              await api.post("/api/affiliates/convert", { orderNumber: order.orderNumber, code });
            } catch (err) {
              console.error("Affiliate conversion failed", err);
            }
          }
        }
      })
      .catch((err) => {
        console.error(err instanceof ApiError ? err.message : err);
        setStatus("failed");
      });
    // cart intentionally omitted from deps — clearing it shouldn't re-trigger this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="shell py-16 text-center">
      {status === "checking" && <>
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-graphite-400" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">Confirming your payment…</h1>
        <p className="mt-1 text-sm text-graphite-600">This only takes a moment.</p>
      </>}
      {status === "success" && <>
        <CheckCircle2 className="mx-auto h-12 w-12 text-verified-600" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">Order confirmed</h1>
        <p className="mt-1 text-sm text-graphite-600">Order <span className="font-mono">{params.orderNumber}</span> has been paid and sent to the vendor(s).</p>
        <Link href="/account" className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">View my orders</Link>
      </>}
      {status === "failed" && <>
        <XCircle className="mx-auto h-12 w-12 text-ember-600" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">We couldn't confirm this payment</h1>
        <p className="mt-1 text-sm text-graphite-600">If you were charged, contact support with order {params.orderNumber} — nothing was lost from your cart.</p>
        <Link href="/support" className="mt-6 inline-block rounded-card border border-graphite-300 px-5 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100">Contact support</Link>
      </>}
    </div>
  );
}
