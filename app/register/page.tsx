"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/auth/register/customer", form);
      await refresh();
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess() {
    setError(null);
    await refresh();
    router.push("/");
  }

  function handleGoogleError(message: string) {
    setError(message);
  }

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-graphite-900 dark:text-white">Create your account</h1>
        <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Join TTFL Store and start shopping.</p>

        <div className="mt-6">
          <GoogleSignIn onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
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
          <TextField label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} optional />
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
  );
}
