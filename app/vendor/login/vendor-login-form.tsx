"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Store } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { ApiUser } from "@/lib/api-types";

export function VendorLoginForm() {
  const router = useRouter();
  const { user, loading, refresh, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as a vendor — skip the form entirely and go
  // straight to the dashboard. router.replace (not push) so the login
  // page doesn't sit in browser history behind the dashboard.
  useEffect(() => {
    if (!loading && user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user: loggedInUser } = await api.post<{ user: ApiUser }>("/api/auth/login", { email, password });
      await refresh();
      redirectByRole(loggedInUser);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  function redirectByRole(loggedInUser: ApiUser) {
    if (loggedInUser.role === "VENDOR") {
      router.push("/vendor/dashboard");
    } else if (loggedInUser.role === "ADMIN") {
      router.push("/admin");
    } else {
      // A customer account used the vendor login page by mistake —
      // there's nothing wrong with their login, just send them
      // somewhere useful instead of straight into a vendor-only wall.
      router.push("/account");
    }
  }

  // Still figuring out auth state — avoid flashing the form before we
  // know whether to redirect instead.
  if (loading) {
    return (
      <div className="shell flex min-h-[70vh] items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-graphite-400" />
      </div>
    );
  }

  // Logged in, but as a non-vendor account — login itself works fine
  // (this backend has no separate "vendor session" concept, one account
  // is permanently one role), so the honest move is to say so plainly
  // and offer to switch accounts, rather than silently redirecting them
  // somewhere they didn't ask for.
  if (user && user.role !== "VENDOR") {
    return (
      <div className="shell flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-sm text-center">
          <Store className="mx-auto h-10 w-10 text-graphite-300" />
          <h1 className="mt-4 text-lg font-bold text-graphite-900">
            You're logged in as {user.role === "ADMIN" ? "an admin" : "a customer"}
          </h1>
          <p className="mt-2 text-sm text-graphite-600">
            This account ({user.email}) isn't a vendor account. Log out to sign in with a different one.
          </p>
          <button
            onClick={() => logout()}
            className="mt-6 rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-card bg-graphite-900 text-white">
            <Store className="h-4.5 w-4.5" />
          </span>
          <h1 className="text-xl font-bold text-graphite-900">Vendor login</h1>
        </div>
        <p className="mt-1.5 text-sm text-graphite-600">Sign in to manage your TTFL Store.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[7px] border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-graphite-700">Password</span>
              <Link href="/forgot-password" className="text-xs text-ember-600 hover:text-ember-700">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[7px] border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600"
            />
          </label>

          {error && <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-graphite-600">
          Don't have a vendor account yet?{" "}
          <Link href="/sell" className="font-medium text-ember-600 hover:text-ember-700">
            Apply to sell
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-graphite-600">
          Shopping instead?{" "}
          <Link href="/login" className="font-medium text-ember-600 hover:text-ember-700">
            Customer login
          </Link>
        </p>
      </div>
    </div>
  );
}
