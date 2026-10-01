"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Store, Clock, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";

type Setup = {
  completed: number;
  total: number;
  percentage: number;
  items: Array<{ key: string; label: string; done: boolean; href: string }>;
};

export default function StoreSetupPage() {
  const [data, setData] = useState<Setup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api
      .get<Setup>("/api/store-hours/setup")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load your store setup."));
  }, []);

  return (
    <main className="shell py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-card bg-ember-100 text-ember-700">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-graphite-900 dark:text-white">Complete your store profile</h1>
            <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-400">
              TTFL Store will guide you through the basics customers need to trust and understand your store.
            </p>
          </div>
        </div>

        {data && (
          <div className="mt-7 rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold text-graphite-900 dark:text-white">
                  {data.completed} of {data.total} completed
                </p>
                <p className="mt-1 text-xs text-graphite-500">
                  A complete profile helps your store look verification-ready. Completing the checklist does not guarantee approval.
                </p>
              </div>
              <span className="text-2xl font-black text-ember-600">{data.percentage}%</span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-cloud-100 dark:bg-graphite-800">
              <div className="h-full rounded-full bg-ember-600" style={{ width: `${data.percentage}%` }} />
            </div>

            <div className="mt-5 space-y-2">
              {data.items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-graphite-100 p-4 hover:border-ember-400 dark:border-graphite-800"
                >
                  <span className={item.done ? "text-verified-600" : "text-graphite-300"}>
                    {item.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </span>
                  <span className={item.done ? "text-sm font-semibold text-graphite-500 line-through" : "text-sm font-semibold text-graphite-900 dark:text-white"}>
                    {item.label}
                  </span>
                  <span className="ml-auto text-xs font-semibold text-ember-600">
                    {item.done ? "Complete" : "Set up →"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm font-semibold text-ember-700">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/vendor/dashboard/business-hours"
            className="inline-flex items-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold dark:border-graphite-700"
          >
            <Clock className="h-4 w-4" />
            Business hours
          </Link>
          <Link
            href="/vendor/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold dark:border-graphite-700"
          >
            <Package className="h-4 w-4" />
            Add a product
          </Link>
        </div>
      </div>
    </main>
  );
}
