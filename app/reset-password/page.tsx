"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("This password reset link is missing its token. Please request a new link.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        {success ? (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">Password updated</h1>
            <p className="mt-2 text-sm leading-relaxed text-graphite-500 dark:text-graphite-400">Your password has been changed successfully. Your previous sessions have been signed out for security.</p>
            <button type="button" onClick={() => router.replace("/login")} className="mt-6 w-full rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">Log in with your new password</button>
          </div>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-ember-600 hover:text-ember-700">← Back to login</Link>
            <div className="mt-5">
              <h1 className="text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">Create a new password</h1>
              <p className="mt-2 text-sm leading-relaxed text-graphite-500 dark:text-graphite-400">Choose a strong password for your TTFL Store account.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-graphite-700 dark:text-graphite-300">New password</span>
                <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none transition focus:border-ember-600 focus:ring-2 focus:ring-ember-600/10 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" />
              </label>
              <p className="-mt-2 text-xs leading-relaxed text-graphite-500 dark:text-graphite-400">Use at least 8 characters with a lowercase letter, uppercase letter, and number.</p>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-graphite-700 dark:text-graphite-300">Confirm new password</span>
                <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none transition focus:border-ember-600 focus:ring-2 focus:ring-ember-600/10 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" />
              </label>
              {error && <p role="alert" className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700 dark:bg-ember-950/50 dark:text-ember-300">{error}</p>}
              <button type="submit" disabled={loading} className="rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white transition hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating password…" : "Update password"}</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
