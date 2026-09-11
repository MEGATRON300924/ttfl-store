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
  const [status, setStatus] = useState<"checking" | "processing" | "success" | "failed">("checking");
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    if (!reference) {
      setStatus("failed");
      setErrorCode("MISSING_PAYMENT_REFERENCE");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const confirmPayment = async () => {
      if (cancelled) return;
      attempts += 1;

      try {
        const { order: confirmedOrder } = await api.get<{ order: ApiOrder }>(`/api/orders/verify/${encodeURIComponent(reference)}`);
        if (cancelled) return;

        setOrder(confirmedOrder);
        setErrorCode(null);

        if (confirmedOrder.paymentStatus === "PAID") {
          setStatus("success");
          cart.clear();
          const code = getStoredAffiliateCode();
          if (code) {
            try {
              await api.post("/api/affiliates/convert", { orderNumber: confirmedOrder.orderNumber, code });
            } catch (err) {
              console.error("Affiliate conversion failed", err);
            }
          }
          return;
        }

        if (confirmedOrder.paymentStatus === "PENDING" && attempts < 11) {
          setStatus("processing");
          retryTimer = setTimeout(confirmPayment, 3000);
          return;
        }

        setStatus("failed");
        setErrorCode(confirmedOrder.paymentStatus === "FAILED" ? "PAYMENT_FAILED" : "PAYMENT_CONFIRMATION_TIMEOUT");
      } catch (err) {
        if (cancelled) return;
        console.error(err instanceof ApiError ? err.message : err);
        setErrorCode(err instanceof ApiError ? err.code ?? `HTTP_${err.status}` : "PAYMENT_CONFIRMATION_FAILED");
        setStatus("failed");
      }
    };

    void confirmPayment();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
    // cart intentionally omitted from deps — clearing it shouldn't re-trigger this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="shell py-16 text-center">
      {status === "checking" && <>
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-graphite-400" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">Confirming your payment…</h1>
        <p className="mt-1 text-sm text-graphite-600">We're securely checking the transaction with Paystack.</p>
      </>}
      {status === "processing" && <>
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-graphite-400" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">Payment is still processing…</h1>
        <p className="mt-1 text-sm text-graphite-600">We're waiting for Paystack to confirm the final payment status. Please don't pay again.</p>
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
        <p className="mt-1 text-sm text-graphite-600">If you were charged, don't pay again. Contact support with order <span className="font-mono">{params.orderNumber}</span>{errorCode ? <> and code <span className="font-mono">{errorCode}</span></> : null}.</p>
        <Link href="/support" className="mt-6 inline-block rounded-card border border-graphite-300 px-5 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100">Contact support</Link>
      </>}
    </div>
  );
}
