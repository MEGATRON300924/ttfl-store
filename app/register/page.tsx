"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { TextField } from "@/components/text-field";
import { GoogleSignIn } from "@/components/google-sign-in";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.phone.trim().length < 7) return setError("A valid phone number is required so TTFL Store can send important WhatsApp notifications and announcements.");
    setSubmitting(true);
    try {
      await api.post("/api/auth/register/customer", { ...form, phone: form.phone.trim() });
      await refresh();
      setVerificationNotice(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess() {
    setError(null);
    await refresh();
    router.push("/account");
  }

  function handleGoogleError(message: string) {
    setError(message);
  }

  function continueToStore() {
    setVerificationNotice(false);
    router.push("/");
  }

  return (
    <>
      <div className="shell flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-graphite-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Join TTFL Store and start shopping.</p>

          <div className="mt-6">
            <GoogleSignIn onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            <p className="mt-2 text-center text-[11px] text-graphite-500">Google may require you to add your phone number in your account profile for WhatsApp notifications.</p>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-graphite-400">
            <span className="h-px flex-1 bg-graphite-200 dark:bg-graphite-700" />
            <span>or create with email</span>
            <span className="h-px flex-1 bg-graphite-200 dark:bg-graphite-700" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
              <TextField label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
            </div>
            <TextField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <TextField label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} hint="Required for WhatsApp order updates, product alerts and TTFL Store announcements." />
            <TextField label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} hint="At least 8 characters, with upper, lower, and a number" />

            {error && <p role="alert" className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

            <button type="submit" disabled={submitting} className="mt-2 rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-graphite-600 dark:text-graphite-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-ember-600 hover:text-ember-700">Log in</Link>
          </p>
        </div>
      </div>

      {verificationNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/60 px-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="verification-title" className="w-full max-w-md rounded-card border border-graphite-200 bg-white p-6 shadow-2xl dark:border-graphite-700 dark:bg-graphite-900">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verified-100 text-verified-700">
              <Mail className="h-7 w-7" />
            </div>
            <div className="mt-5 text-center">
              <h2 id="verification-title" className="text-xl font-bold text-graphite-900 dark:text-white">Check your email</h2>
              <p className="mt-2 text-sm leading-6 text-graphite-600 dark:text-graphite-400">
                Your TTFL Store account has been created. We sent a verification link to <strong className="text-graphite-900 dark:text-white">{form.email}</strong>. Open the email and click <strong className="text-graphite-900 dark:text-white">Verify email</strong> to finish verifying your account.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button onClick={continueToStore} className="inline-flex flex-1 items-center justify-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">
                <CheckCircle2 className="h-4 w-4" /> Continue to TTFL Store
              </button>
              <button onClick={() => setVerificationNotice(false)} className="rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-700 hover:border-graphite-300 dark:border-graphite-700 dark:text-graphite-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
