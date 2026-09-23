"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Mail, RefreshCw, Send } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

type EmailStatus = {
  provider: string;
  from: string;
  adminNotificationEmail: string | null;
  configured: boolean;
  queue: { pending: number; retrying: number; failed: number };
};

export default function AdminEmailSettingsPage() {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setStatus(await api.get<EmailStatus>("/api/admin/email/status"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load email configuration.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function sendTest() {
    setTesting(true);
    setMessage(null);
    setError(null);
    try {
      const result = await api.post<{ message: string }>("/api/admin/email/test", {});
      setMessage(result.message);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send the test email.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="shell py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-graphite-900">Email configuration</h1>
          <p className="mt-1 text-sm text-graphite-600">Check the production email provider, sender, admin alerts, and delivery queue.</p>
        </div>
        <Link href="/admin/email-logs" className="inline-flex items-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-800">
          <Mail className="h-4 w-4" /> Email logs
        </Link>
      </div>

      {message && <p className="mt-5 rounded-card bg-verified-100 px-4 py-3 text-sm text-verified-700">{message}</p>}
      {error && <p className="mt-5 rounded-card bg-ember-100 px-4 py-3 text-sm text-ember-700">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-graphite-600">Checking email configuration…</p>
      ) : status ? (
        <>
          <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Mail className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-graphite-900">Provider configuration</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Provider</p><p className="mt-1 font-semibold text-graphite-900">{status.provider}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Sender</p><p className="mt-1 break-all font-semibold text-graphite-900">{status.from}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Admin notifications</p><p className="mt-1 break-all font-semibold text-graphite-900">{status.adminNotificationEmail || "Not configured"}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Configuration</p><p className="mt-1 inline-flex items-center gap-1 font-semibold">{status.configured ? <><CheckCircle2 className="h-4 w-4 text-verified-600" /> Ready</> : <><AlertTriangle className="h-4 w-4 text-ember-600" /> Not ready</>}</p></div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-card border border-graphite-200 bg-white p-5">
            <h2 className="font-bold text-graphite-900">Delivery queue</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-card bg-cloud-100 p-4"><p className="text-xs text-graphite-500">Pending</p><p className="mt-1 text-2xl font-bold text-graphite-900">{status.queue.pending}</p></div>
              <div className="rounded-card bg-gold-100 p-4"><p className="text-xs text-graphite-500">Retrying</p><p className="mt-1 text-2xl font-bold text-graphite-900">{status.queue.retrying}</p></div>
              <div className="rounded-card bg-ember-100 p-4"><p className="text-xs text-graphite-500">Failed</p><p className="mt-1 text-2xl font-bold text-graphite-900">{status.queue.failed}</p></div>
            </div>
          </section>

          <section className="mt-4 rounded-card border border-graphite-200 bg-white p-5">
            <h2 className="font-bold text-graphite-900">Test delivery</h2>
            <p className="mt-1 text-sm leading-6 text-graphite-600">The test is sent only to the email address on your currently signed-in administrator account. No arbitrary recipient can be entered here.</p>
            <button type="button" onClick={() => void sendTest()} disabled={testing || !status.configured} className="mt-4 inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {testing ? "Queueing test…" : "Send test email"}
            </button>
          </section>
        </>
      ) : null}
    </div>
  );
}
