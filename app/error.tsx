"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; referenceCode?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  async function copyErrorCode() {
    const code = error.referenceCode;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-12 w-12 text-ember-500" />
      <h1 className="mt-4 text-2xl font-bold text-graphite-900">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-graphite-600">
        We hit an unexpected error. Try again, or head back to the homepage.
      </p>

      {error.referenceCode && (
        <div className="mt-5 w-full max-w-sm rounded-card border border-graphite-200 bg-white p-4 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-graphite-500">
            TTFL error code
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-[7px] bg-cloud-100 px-3 py-2 font-mono text-sm font-bold text-graphite-900">
              {error.referenceCode}
            </code>
            <button
              type="button"
              onClick={copyErrorCode}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[7px] border border-graphite-200 bg-white px-3 py-2 text-xs font-semibold text-graphite-800 hover:bg-cloud-100"
              aria-label="Copy TTFL error code"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
          <p className="mt-2 text-xs text-graphite-500">
            Copy this code when contacting TTFL Store support.
          </p>
        </div>
      )}

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
