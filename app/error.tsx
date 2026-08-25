"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log for developers; never render error.message/stack to the user —
    // spec §34 "never expose stack traces to users."
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-12 w-12 text-ember-500" />
      <h1 className="mt-4 text-2xl font-bold text-graphite-900">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-graphite-600">
        We hit an unexpected error. Try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-card border border-graphite-300 px-5 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
