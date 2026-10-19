"use client";

import { useEffect, useState } from "react";
import { BellRing, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { enableWebPush } from "@/lib/web-push";

const DISMISSED_KEY = "ttfl-notification-prompt-dismissed";

export function NotificationPermissionPrompt() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user || typeof window === "undefined") return;
    if (!( "Notification" in window) || Notification.permission !== "default") return;
    if (window.localStorage.getItem(DISMISSED_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), 1800);
    return () => window.clearTimeout(timer);
  }, [loading, user]);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setOpen(false);
  }

  async function enable() {
    if (!( "Notification" in window) || !( "serviceWorker" in navigator)) {
      setMessage("This browser does not support browser notifications.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const result = await enableWebPush();
        window.localStorage.setItem(DISMISSED_KEY, "1");
        setOpen(false);
        window.dispatchEvent(new CustomEvent("ttfl-web-push-enabled", { detail: result }));
      } else {
        window.localStorage.setItem(DISMISSED_KEY, "1");
        setOpen(false);
      }
    } catch (error) {
      // Keep the actual failure visible so configuration, authentication, and
      // browser/service-worker errors can be diagnosed instead of masking them.
      const reason = error instanceof Error ? error.message : "An unexpected error occurred.";
      setMessage(`We couldn't enable notifications: ${reason} You can try again from Notification settings in your account.`);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-graphite-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="notification-prompt-title" className="w-full max-w-md rounded-3xl border border-graphite-200 bg-white p-6 shadow-2xl dark:border-graphite-700 dark:bg-graphite-900 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ember-100 text-ember-700 dark:bg-ember-900/40 dark:text-ember-300"><BellRing className="h-6 w-6" /></span>
          <button type="button" onClick={dismiss} aria-label="Close notification prompt" className="rounded-full p-2 text-graphite-500 hover:bg-cloud-100 dark:hover:bg-graphite-800"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-ember-600">Stay in the loop</p>
        <h2 id="notification-prompt-title" className="mt-1 text-xl font-bold tracking-tight text-graphite-900 dark:text-white">Allow TTFL Store notifications?</h2>
        <p className="mt-2 text-sm leading-6 text-graphite-600 dark:text-graphite-300">Get browser alerts for important order updates, account activity, and products you’ve joined the waitlist for. You can change your browser permission anytime.</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-graphite-500 dark:text-graphite-400"><ShieldCheck className="h-4 w-4 shrink-0" />You’re in control. We’ll only ask once unless you revisit settings.</div>
        {message && <p role="status" className="mt-3 text-sm text-ember-700 dark:text-ember-300">{message}</p>}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={dismiss} className="rounded-xl border border-graphite-200 px-4 py-3 text-sm font-semibold text-graphite-700 hover:bg-cloud-100 dark:border-graphite-700 dark:text-graphite-200 dark:hover:bg-graphite-800">Not now</button>
          <button type="button" onClick={() => void enable()} disabled={busy} className="rounded-xl bg-ember-600 px-4 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">{busy ? "Enabling…" : "Allow notifications"}</button>
        </div>
      </section>
    </div>
  );
}
