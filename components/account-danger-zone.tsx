"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";

export function AccountDangerZone() {
  const { logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    if (!window.confirm("Delete your TTFL Store account permanently? This cannot be undone.")) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete("/api/auth/account");
      await logout();
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete your account");
      setDeleting(false);
    }
  }

  return (
    <section className="mt-10 rounded-card border border-ember-200 bg-ember-50/60 p-5 dark:border-ember-500/30 dark:bg-ember-950/20">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-ember-100 text-ember-700 dark:bg-ember-900/40 dark:text-ember-300">
          <Trash2 className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-graphite-900 dark:text-white">Delete account</h2>
          <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-300">
            Permanently delete your TTFL Store account. You will be logged out immediately and this action cannot be undone.
          </p>
        </div>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-ember-700 dark:text-ember-300">{error}</p>}
      <button
        type="button"
        onClick={() => void deleteAccount()}
        disabled={deleting}
        className="mt-4 inline-flex items-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        {deleting ? "Deleting…" : "Delete account"}
      </button>
    </section>
  );
}
