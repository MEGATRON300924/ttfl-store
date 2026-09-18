"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function VendorDashboardBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-5 inline-flex items-center gap-2 rounded-card border border-graphite-200 bg-white px-3.5 py-2 text-sm font-semibold text-graphite-700 transition hover:border-ember-500 hover:text-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-200 dark:hover:border-ember-500 dark:hover:text-ember-400"
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
