"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";
import type { ApiOrder } from "@/lib/api-types";
import { getStoredAffiliateCode } from "@/components/affiliate-tracker";

type PaymentStatusResponse = {
  reference: string;
  orderNumber: string;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  orderFinalized: boolean;
  gatewayStatus: string;
  gatewayResponse: string;
};

type ApiOrderWithPaymentReference = ApiOrder & { paymentReference?: string | null };

export function OrderConfirmView() {
  const params = useParams<{ orderNumber: string }>();
  const cart = useCart();
  const [status, setStatus] = useState<"checking" | "processing" | "success" | "failed">("checking");
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [order, setOrder] = useState<ApiOrderWithPaymentReference | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const checkPaymentStatus = useCallback(async () => {
    const currentOrder = await api.get<ApiOrderWithPaymentReference>(`/api/orders/${encodeURIComponent(params.orderNumber)}`);
    setOrder(currentOrder);

    if (!currentOrder.paymentReference) {
      throw new Error("Payment reference is missing from the order");
    }

    const payment = await api.get<PaymentStatusResponse>(`/api/orders/payment-status/${encodeURIComponent(currentOrder.paymentReference)}`);
    return { currentOrder, payment };
  }, [params.orderNumber]);

  const finishSuccess = useCallback((confirmedOrder: ApiOrderWithPaymentReference) => {
    setOrder(confirmedOrder);
    setStatus("success");
    setPaymentReceived(true);
    cart.clear();
    const code = getStoredAffiliateCode();
    if (code) {
      void api.post("/api/affiliates/convert", { orderNumber: confirmedOrder.orderNumber, code }).catch((err) => {
        console.error("Affiliate conversion failed", err);
      });
    }
  }, [cart]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const poll = async () => {
      if (cancelled) return;
      attempt += 1;
      setAttempts(attempt);

      try {
        const { currentOrder, payment } = await checkPaymentStatus();
        if (cancelled) return;

        if (payment.paymentStatus === "PAID") {
          setPaymentReceived(true);
          if (payment.orderFinalized || currentOrder.paymentStatus === "PAID") {
            finishSuccess(currentOrder);
            return;
          }

          // Paystack has confirmed the money, but order fulfillment is still running.
          // Do not make the customer wait for the fulfillment transaction before telling
          // them that their payment was received.
          setStatus("processing");
          setErrorCode(null);
          if (attempt < 16) retryTimer = setTimeout(poll, 2000);
          return;
        }

        if (payment.gatewayStatus === "failed" || payment.gatewayStatus === "abandoned" || currentOrder.paymentStatus === "FAILED") {
          setStatus("failed");
          setErrorCode("PAYMENT_FAILED");
          return;
        }

        setStatus("processing");
        setErrorCode(null);
        if (attempt < 16) retryTimer = setTimeout(poll, 2000);
      } catch (err) {
        if (cancelled) return;
        console.error(err instanceof ApiError ? err.message : err);
        setErrorCode(err instanceof ApiError ? err.code ?? `HTTP_${err.status}` : "PAYMENT_STATUS_CHECK_FAILED");
        setStatus("failed");
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [checkPaymentStatus, finishSuccess]);

  const retry = async () => {
    setStatus("checking");
    setErrorCode(null);
    try {
      const { currentOrder, payment } = await checkPaymentStatus();
      setOrder(currentOrder);
      if (payment.paymentStatus === "PAID") {
        setPaymentReceived(true);
        if (payment.orderFinalized || currentOrder.paymentStatus === "PAID") {
          finishSuccess(currentOrder);
        } else {
          setStatus("processing");
        }
        return;
      }
      if (payment.gatewayStatus === "failed" || payment.gatewayStatus === "abandoned" || currentOrder.paymentStatus === "FAILED") {
        setStatus("failed");
        setErrorCode("PAYMENT_FAILED");
        return;
      }
      setStatus("processing");
    } catch (err) {
      setErrorCode(err instanceof ApiError ? err.code ?? `HTTP_${err.status}` : "PAYMENT_STATUS_CHECK_FAILED");
      setStatus("failed");
    }
  };

  return (
    <div className="shell py-16 text-center">
      {status === "checking" && <>
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-graphite-400" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">Checking your payment…</h1>
        <p className="mt-1 text-sm text-graphite-600">We're checking Paystack directly so you don't have to wait for order processing.</p>
      </>}
      {status === "processing" && <>
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-graphite-400" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">{paymentReceived ? "Payment received — finishing your order…" : "Payment is being confirmed…"}</h1>
        <p className="mt-1 text-sm text-graphite-600">{paymentReceived ? "Your money has been received. We're finishing the order in the background. Please don't pay again." : "Paystack is confirming the transaction. Please don't pay again."}</p>
        {attempts >= 16 && <button onClick={retry} className="mt-6 rounded-card border border-graphite-300 px-5 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100">Check again</button>}
      </>}
      {status === "success" && <>
        <CheckCircle2 className="mx-auto h-12 w-12 text-verified-600" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">Order confirmed</h1>
        <p className="mt-1 text-sm text-graphite-600">Order <span className="font-mono">{order?.orderNumber ?? params.orderNumber}</span> has been paid and sent to the vendor(s).</p>
        <Link href="/account" className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">View my orders</Link>
      </>}
      {status === "failed" && <>
        <XCircle className="mx-auto h-12 w-12 text-ember-600" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">We couldn't confirm this payment</h1>
        <p className="mt-1 text-sm text-graphite-600">If you were charged, don't pay again. Contact support with order <span className="font-mono">{params.orderNumber}</span>{errorCode ? <> and code <span className="font-mono">{errorCode}</span></> : null}.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={retry} className="rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">Check again</button>
          <Link href="/support" className="rounded-card border border-graphite-300 px-5 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100">Contact support</Link>
        </div>
      </>}
    </div>
  );
}
