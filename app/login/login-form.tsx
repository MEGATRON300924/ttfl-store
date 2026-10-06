"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { GoogleSignIn } from "@/components/google-sign-in";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthenticatedUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await api.post<{ user: import("@/lib/api-types").ApiUser }>("/api/auth/login", { email, password });
      setAuthenticatedUser(user);
      await continueToDestination(searchParams.get("next"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const handleGoogleSuccess = useCallback(async (user: import("@/lib/api-types").ApiUser) => {
    setError(null);
    setAuthenticatedUser(user);
    router.push(searchParams.get("next") ?? "/");
  }, [router, searchParams, setAuthenticatedUser]);

  async function continueToDestination(next: string | null) {
    const destination = next || "/";
    try {
      const url = new URL(destination, window.location.origin);
      const allowedHosts = new Set(["ttflstore.name.ng", "www.ttflstore.name.ng", "cars.ttflstore.name.ng", "homes.ttflstore.name.ng"]);
      if (url.origin !== window.location.origin && !allowedHosts.has(url.hostname)) throw new Error("Invalid redirect destination");
      if (url.origin === window.location.origin) {
        router.push(url.pathname + url.search + url.hash);
        return;
      }
      const handoff = await api.post<{ token: string }>("/api/auth/handoff/create", {});
      url.searchParams.set("handoff", handoff.token);
      window.location.assign(url.toString());
    } catch {
      router.push("/");
    }
  }

  const handleGoogleError = useCallback((message: string) => {
    setError(message);
  }, []);

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-graphite-900">Log in to TTFL Store</h1>

        <GoogleSignIn onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

        <div className="my-5 flex items-center gap-3 text-xs text-graphite-400">
          <span className="h-px flex-1 bg-graphite-200" />
          <span>or continue with email</span>
          <span className="h-px flex-1 bg-graphite-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite-700">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-[7px] border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-graphite-700">Password</span>
              <Link href="/forgot-password" className="text-xs text-ember-600 hover:text-ember-700">Forgot password?</Link>
            </div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-[7px] border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600" />
          </label>

          {error && <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

          <button type="submit" disabled={submitting} className="mt-2 rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-graphite-600">New here? <Link href="/register" className="font-medium text-ember-600 hover:text-ember-700">Create an account</Link></p>
        <p className="mt-2 text-center text-sm text-graphite-600">Want to sell? <Link href="/sell" className="font-medium text-ember-600 hover:text-ember-700">Become a vendor</Link></p>
      </div>
    </div>
  );
}
