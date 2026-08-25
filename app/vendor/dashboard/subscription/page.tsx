"use client";

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
        await load(); // FREE tier activates instantly, no redirect
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change your plan");
      setBusyTier(null);
    }
  }

  async function cancel() {
    if (!confirm("Cancel your subscription? You'll drop to the Free plan immediately.")) return;
    await api.post("/api/subscriptions/cancel");
    await load();
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Subscription</h1>

      {subscription && (
        <div className="mt-4 rounded-card border border-graphite-200 p-4">
          <p className="text-sm text-graphite-600">Current plan</p>
          <p className="text-lg font-bold text-graphite-900">{subscription.plan.name}</p>
          <p className="text-xs text-graphite-400">
            Status: {subscription.status.toLowerCase()}
            {subscription.renewalDate &&
              ` · renews ${new Date(subscription.renewalDate).toLocaleDateString("en-NG", { dateStyle: "medium" })}`}
          </p>
          {subscription.status === "ACTIVE" && subscription.plan.tier !== "FREE" && (
            <button onClick={cancel} className="mt-2 text-sm font-medium text-ember-600 hover:text-ember-700">
              Cancel subscription
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans === null ? (
          <p className="text-sm text-graphite-600">Loading plans…</p>
        ) : (
          plans.map((plan) => {
            const isCurrent = subscription?.plan.tier === plan.tier && subscription.status === "ACTIVE";
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

                <button
                  onClick={() => changeTo(plan.tier)}
                  disabled={isCurrent || busyTier === plan.tier}
                  className={`mt-4 rounded-card py-2.5 text-sm font-semibold disabled:opacity-60 ${
                    isCurrent
                      ? "bg-cloud-100 text-graphite-500"
                      : "bg-ember-600 text-white hover:bg-ember-700"
                  }`}
                >
                  {isCurrent ? "Current plan" : busyTier === plan.tier ? "Processing…" : "Choose plan"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
