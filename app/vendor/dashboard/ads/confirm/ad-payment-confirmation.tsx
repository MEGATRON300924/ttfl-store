"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

export default function AdPaymentConfirmation() {
  const params = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");
  const [status, setStatus] = useState("Verifying your advertising payment…");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setError("No payment reference was provided.");
      return;
    }

    void api
      .get(`/api/ads/campaigns/${encodeURIComponent(reference)}/verify`)
      .then(() => setStatus("Your campaign is now active. TTFL will begin serving it according to your targeting."))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to verify payment."));
  }, [reference]);

  return (
    <div className="shell py-20">
      <div className="mx-auto max-w-lg rounded-card border border-graphite-200 bg-white p-8 text-center dark:border-graphite-700 dark:bg-graphite-900">
        {error ? (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ember-100 text-ember-700">!</div>
            <h1 className="mt-5 text-xl font-bold">Payment verification failed</h1>
            <p className="mt-2 text-sm text-graphite-500">{error}</p>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verified-100 text-verified-700">
              {status.startsWith("Your") ? <CheckCircle2 className="h-7 w-7" /> : <Loader2 className="h-7 w-7 animate-spin" />}
            </div>
            <h1 className="mt-5 text-xl font-bold">{status.startsWith("Your") ? "Campaign launched" : "Checking payment"}</h1>
            <p className="mt-2 text-sm text-graphite-500">{status}</p>
          </>
        )}
        <Link href="/vendor/dashboard/ads" className="mt-6 inline-flex rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white">
          Back to Ad Centre
        </Link>
      </div>
    </div>
  );
}
