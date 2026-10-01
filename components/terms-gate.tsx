"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";

export const CURRENT_TERMS_VERSION = "2026-10-01-v1";

export function TermsGate() {
  const { user, loading, refresh } = useAuth();
  const [checked, setChecked] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setChecked(true);
      return;
    }
    setAccepted(user.termsAcceptedVersion === CURRENT_TERMS_VERSION);
    setChecked(true);
  }, [loading, user]);

  async function accept() {
    if (!agreed || accepting) return;
    setAccepting(true);
    setError(null);
    try {
      await api.post("/api/legal/terms/accept");
      await refresh();
      setAccepted(true);
      setAgreed(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't record your acceptance. Please try again.");
    } finally {
      setAccepting(false);
    }
  }

  if (!checked || !user || accepted) return null;

  const isVendor = user.role === "VENDOR";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="terms-gate-title">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-graphite-200 bg-white shadow-2xl dark:border-graphite-700 dark:bg-graphite-900">
        <div className="border-b border-graphite-200 bg-cloud-50 p-6 dark:border-graphite-700 dark:bg-graphite-950">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ember-100 text-ember-700 dark:bg-ember-950/50 dark:text-ember-300"><FileText className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-600">TTFL Store · Updated Terms</p>
              <h2 id="terms-gate-title" className="mt-1 text-xl font-bold text-graphite-900 dark:text-white">Please review our Terms and Conditions</h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm leading-6 text-graphite-700 dark:text-graphite-300">
            TTFL Store has released its marketplace Terms and Conditions. {isVendor ? "Because you operate a vendor account, you must review and accept the current terms before continuing to use the vendor dashboard." : "Please review and accept the current terms before continuing to use your TTFL Store account."}
          </p>

          <Link href="/legal/terms" target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-between rounded-xl border border-graphite-200 p-4 hover:border-ember-400 hover:bg-cloud-50 dark:border-graphite-700 dark:hover:bg-graphite-800">
            <span><span className="block text-sm font-bold text-graphite-900 dark:text-white">Read the full Terms and Conditions</span><span className="mt-1 block text-xs text-graphite-500">Version {CURRENT_TERMS_VERSION} · Opens in a new tab</span></span>
            <FileText className="h-5 w-5 text-ember-600" />
          </Link>

          <label className="mt-5 flex items-start gap-3 rounded-xl border border-graphite-200 p-4 dark:border-graphite-700">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-ember-600" />
            <span className="text-sm leading-6 text-graphite-700 dark:text-graphite-300">I have reviewed the TTFL Store Terms and Conditions and agree to follow them while using TTFL Store.</span>
          </label>

          {error && <p role="alert" className="mt-3 text-sm font-medium text-ember-700 dark:text-ember-300">{error}</p>}

          <button type="button" disabled={!agreed || accepting} onClick={() => void accept()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ember-600 px-5 py-3 text-sm font-bold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-50">
            {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {accepting ? "Recording acceptance…" : "Agree and continue"}
          </button>

          <p className="mt-3 text-center text-[11px] leading-5 text-graphite-500">Your acceptance records the current terms version and acceptance time. You can review the Terms again from the Legal section at any time.</p>
        </div>
      </div>
    </div>
  );
}
