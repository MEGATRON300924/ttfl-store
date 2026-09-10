"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <Link href="/login" className="text-sm font-medium text-ember-600 hover:text-ember-700">← Back to login</Link>
        <div className="mt-5">
          <h1 className="text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">Forgot your password?</h1>
          <p className="mt-2 text-sm leading-relaxed text-graphite-500 dark:text-graphite-400">Enter the email address on your TTFL Store account and we&apos;ll send you a secure password reset link.</p>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-card border border-verified-200 bg-verified-50 p-4 dark:border-verified-800 dark:bg-verified-950/30">
            <p className="text-sm font-semibold text-verified-800 dark:text-verified-300">Check your email</p>
            <p className="mt-1 text-sm leading-relaxed text-verified-700 dark:text-verified-400">If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.</p>
            <button type="button" onClick={() => setSubmitted(false)} className="mt-4 text-sm font-semibold text-verified-800 underline underline-offset-2 dark:text-verified-300">Try another email</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-graphite-700 dark:text-graphite-300">Email</span>
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none transition focus:border-ember-600 focus:ring-2 focus:ring-ember-600/10 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" />
            </label>
            {error && <p role="alert" className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700 dark:bg-ember-950/50 dark:text-ember-300">{error}</p>}
            <button type="submit" disabled={loading} className="rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white transition hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Sending reset link…" : "Send reset link"}</button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-graphite-500 dark:text-graphite-400">Remember your password? <Link href="/login" className="font-semibold text-ember-600 hover:text-ember-700">Log in</Link></p>
      </div>
    </main>
  );
}
