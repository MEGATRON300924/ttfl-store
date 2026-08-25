"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

export function SubscriptionConfirmView() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");

  useEffect(() => {
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    if (!reference) {
      setStatus("failed");
      return;
    }
    api
      .get(`/api/subscriptions/verify/${reference}`)
      .then(() => setStatus("success"))
      .catch((err) => {
        console.error(err instanceof ApiError ? err.message : err);
        setStatus("failed");
      });
  }, [searchParams]);

  return (
    <div className="shell py-16 text-center">
      {status === "checking" && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-graphite-400" />
          <h1 className="mt-4 text-lg font-bold text-graphite-900">Confirming your payment…</h1>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-verified-600" />
          <h1 className="mt-4 text-lg font-bold text-graphite-900">Plan updated</h1>
          <p className="mt-1 text-sm text-graphite-600">Your new plan is active.</p>
          <Link
            href="/vendor/dashboard/subscription"
            className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
          >
            Back to subscription
          </Link>
        </>
      )}
      {status === "failed" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-ember-600" />
          <h1 className="mt-4 text-lg font-bold text-graphite-900">We couldn't confirm this payment</h1>
          <Link
            href="/vendor/dashboard/subscription"
            className="mt-6 inline-block rounded-card border border-graphite-300 px-5 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100"
          >
            Try again
          </Link>
        </>
      )}
    </div>
  );
}
