"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiSubscription, ApiVendorPlan } from "@/lib/api-types";

export default function VendorSubscriptionPage() {
  const [plans, setPlans] = useState<ApiVendorPlan[] | null>(null);
  const [subscription, setSubscription] = useState<ApiSubscription | null>(null);
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [plansRes, subRes] = await Promise.all([
      api.get<{ plans: ApiVendorPlan[] }>("/api/vendor-plans"),
      api.get<{ subscription: ApiSubscription | null }>("/api/subscriptions/me"),
    ]);
    setPlans(plansRes.plans);
    setSubscription(subRes.subscription);
  }

  useEffect(() => {
    void load();
  }, []);

  async function changeTo(tier: string) {
    setBusyTier(tier);
    setError(null);
    try {
      const result = await api.post<{ checkoutUrl: string | null }>("/api/subscriptions/change", { tier });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change your plan");
      setBusyTier(null);
    }
  }

  return (
    <div className="shell py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-graphite-900">Pricing plans</h1>
          <p className="mt-1 text-sm text-graphite-500">Choose the plan that fits your store.</p>
        </div>
        {subscription && subscription.plan.tier !== "FREE" && (
          <Link
            href="/vendor/dashboard/subscription/manage"
            className="inline-flex items-center justify-center rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            Manage plan
          </Link>
        )}
      </div>

      {subscription && subscription.plan.tier !== "FREE" && (
        <div className="mt-5 rounded-card border border-graphite-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite-400">Current plan</p>
              <p className="mt-1 text-lg font-bold text-graphite-900">{subscription.plan.name}</p>
              <p className="mt-1 text-sm text-graphite-500">
                {subscription.status === "CANCELLED"
                  ? subscription.renewalDate
                    ? `Cancellation scheduled for ${new Date(subscription.renewalDate).toLocaleDateString("en-NG", { dateStyle: "medium" })}`
                    : "Cancellation scheduled"
                  : subscription.renewalDate
                    ? `Renews ${new Date(subscription.renewalDate).toLocaleDateString("en-NG", { dateStyle: "medium" })}`
                    : "Active subscription"}
              </p>
            </div>
            <Link
              href="/vendor/dashboard/subscription/manage"
              className="text-sm font-semibold text-ember-600 hover:text-ember-700"
            >
              View details →
            </Link>
          </div>
        </div>
      )}

      {error && <p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans === null ? (
          <p className="text-sm text-graphite-600">Loading plans…</p>
        ) : (
          plans.map((plan) => {
            const isCurrent = subscription?.plan.tier === plan.tier && ["ACTIVE", "CANCELLED"].includes(subscription.status);
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-card border p-5 ${
                  isCurrent ? "border-ember-600 ring-1 ring-ember-600" : "border-graphite-200"
                }`}
              >
                <p className="text-sm font-semibold text-graphite-900">{plan.name}</p>
                <p className="mt-1 font-mono text-2xl font-bold text-graphite-900">
                  {Number(plan.price) === 0 ? "Free" : formatNaira(Number(plan.price))}
                </p>
                {Number(plan.price) > 0 && (
                  <p className="text-xs text-graphite-400">per {plan.billingPeriod === "MONTHLY" ? "month" : "year"}</p>
                )}
                <p className="mt-3 text-xs text-graphite-600">
                  {plan.productLimit ? `Up to ${plan.productLimit} products` : "Unlimited products"}
                </p>
                <p className="text-xs text-graphite-600">{Number(plan.commissionRate)}% commission</p>

                {plan.features && plan.features.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-graphite-700">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-verified-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {isCurrent ? (
                  <Link
                    href="/vendor/dashboard/subscription/manage"
                    className="mt-4 rounded-card bg-cloud-100 py-2.5 text-center text-sm font-semibold text-graphite-700 hover:bg-cloud-200"
                  >
                    Manage plan
                  </Link>
                ) : (
                  <button
                    onClick={() => changeTo(plan.tier)}
                    disabled={busyTier === plan.tier}
                    className="mt-4 rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
                  >
                    {busyTier === plan.tier ? "Processing…" : "Choose plan"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
