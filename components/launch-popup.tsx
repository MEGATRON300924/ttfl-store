"use client";

import { useEffect, useState } from "react";
import { Gift, X, Copy, Check } from "lucide-react";

const STORAGE_KEY = "ttfl-store-launch-popup-seen";

export function LaunchPopup() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "true") {
        const timer = window.setTimeout(() => setOpen(true), 450);
        return () => window.clearTimeout(timer);
      }
    } catch {
      const timer = window.setTimeout(() => setOpen(true), 450);
      return () => window.clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText("TTFLSTOREISBACK");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ttfl-launch-title"
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-ember-200 bg-white shadow-2xl dark:border-ember-900 dark:bg-graphite-950"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close launch announcement"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-graphite-600 shadow-sm transition hover:bg-graphite-100 hover:text-graphite-950 dark:bg-graphite-900/90 dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-ember-600 via-ember-500 to-gold-500 px-6 pb-7 pt-8 text-white">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/25">
            <Gift className="h-7 w-7" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/80">
            Welcome back
          </p>
          <h2 id="ttfl-launch-title" className="mt-1 text-3xl font-black tracking-tight">
            TTFL Store is Open 🎉
          </h2>
          <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-white/90">
            We&apos;re back and ready for you. Celebrate the launch with 25% off your order.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl border border-dashed border-ember-300 bg-ember-50 p-4 dark:border-ember-800 dark:bg-ember-950/30">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-700 dark:text-ember-300">
              Launch coupon
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <code className="text-base font-black tracking-wide text-graphite-950 dark:text-white">
                TTFLSTOREISBACK
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-graphite-950 px-3 py-2 text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-graphite-800 active:scale-95 dark:bg-white dark:text-graphite-950 dark:hover:bg-graphite-100"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-graphite-600 dark:text-graphite-400">
              Get <strong>25% off</strong> when you use this code at checkout.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 rounded-2xl bg-ember-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ember-700 active:scale-[0.98]"
            >
              Start shopping
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-2xl border border-graphite-200 px-4 py-3 text-sm font-bold text-graphite-700 transition hover:bg-graphite-50 active:scale-[0.98] dark:border-graphite-700 dark:text-graphite-200 dark:hover:bg-graphite-900"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
