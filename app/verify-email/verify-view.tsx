"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, MailWarning } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

type Status = "verifying" | "success" | "invalid" | "error";

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");

  // Guards against the request firing more than once for the same mount —
  // without this, React re-renders (StrictMode in dev, route
  // re-evaluation, etc.) can trigger the effect twice, and the SECOND
  // call hits an already-consumed token and reports "invalid" even
  // though the first call just succeeded seconds earlier. This ref
  // persists across re-renders (unlike state) and is the standard fix
  // for exactly this race.
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }

    api
      .post("/api/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 400) {
          setStatus("invalid");
        } else {
          setStatus("error");
        }
      });
    // Deliberately run once per mount only — see firedRef above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-graphite-400" />
            <h1 className="mt-4 text-lg font-bold text-graphite-900">Verifying your email…</h1>
            <p className="mt-1 text-sm text-graphite-600">This only takes a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-verified-600" />
            <h1 className="mt-4 text-lg font-bold text-graphite-900">Email verified</h1>
            <p className="mt-1 text-sm text-graphite-600">
              Your email address has been confirmed. You're all set to start shopping or selling on TTFL Store.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
            >
              Continue to login
            </Link>
          </>
        )}

        {status === "invalid" && (
          <>
            <MailWarning className="mx-auto h-12 w-12 text-ember-600" />
            <h1 className="mt-4 text-lg font-bold text-graphite-900">Link invalid or expired</h1>
            <p className="mt-1 text-sm text-graphite-600">
              This verification link isn't valid anymore — it may have already been used, or it's expired.
              If you've already verified your email, you can just log in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-ember-600" />
            <h1 className="mt-4 text-lg font-bold text-graphite-900">Something went wrong</h1>
            <p className="mt-1 text-sm text-graphite-600">
              We couldn't verify your email right now. Please try again in a moment.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-card border border-graphite-300 px-5 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
