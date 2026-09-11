"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Store } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiSubscription, ApiUser } from "@/lib/api-types";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", { dateStyle: "medium" });
}

export default function ManageSubscriptionPage() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [subscription, setSubscription] = useState<ApiSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [me, sub] = await Promise.all([
        api.get<{ user: ApiUser }>("/api/auth/me"),
        api.get<{ subscription: ApiSubscription | null }>("/api/subscriptions/me"),
      ]);
      setUser(me.user);
      setSubscription(sub.subscription);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your subscription");
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancel() {
    if (!subscription?.renewalDate) return;
    const endDate = formatDate(subscription.renewalDate);
    if (!confirm(`Cancel ${subscription.plan.name}? Your plan and its benefits will remain active until ${endDate}.`)) return;

    setBusy(true);
    setError(null);
    try {
      await api.post("/api/subscriptions/cancel");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't cancel your subscription");
      setBusy(false);
    }
  }

  async function resume() {
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/subscriptions/resume");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't resume your subscription");
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="shell py-8 text-sm text-graphite-500">Loading subscription…</div>;
  }

  if (!subscription) {
    return (
      <div className="shell py-8">
        <Link href="/vendor/dashboard/subscription" className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-600 hover:text-graphite-900">
          <ArrowLeft className="h-4 w-4" /> Back to plans
        </Link>
        <div className="mt-8 rounded-card border border-graphite-200 p-6">
          <h1 className="text-xl font-bold text-graphite-900">No subscription yet</h1>
          <p className="mt-2 text-sm text-graphite-500">Choose a plan to get started with your store.</p>
          <Link href="/vendor/dashboard/subscription" className="mt-5 inline-flex rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white">
            View plans
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = subscription.status === "CANCELLED";
  const isPaid = subscription.plan.tier !== "FREE";

  return (
    <div className="shell py-8">
      <Link href="/vendor/dashboard/subscription" className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-600 hover:text-graphite-900">
        <ArrowLeft className="h-4 w-4" /> Back to plans
      </Link>

      <div className="mt-5 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-card bg-cloud-100 text-graphite-700">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite-400">Store subscription</p>
          <h1 className="text-2xl font-bold text-graphite-900">{user?.vendorProfile?.storeName ?? "Your store"}</h1>
        </div>
      </div>

      {error && <p className="mt-5 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      <div className="mt-6 max-w-3xl rounded-card border border-graphite-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-graphite-500">Current plan</p>
            <h2 className="mt-1 text-2xl font-bold text-graphite-900">{subscription.plan.name}</h2>
            {isPaid && (
              <p className="mt-1 text-sm text-graphite-500">
                {formatNaira(Number(subscription.plan.price))} / {subscription.plan.billingPeriod === "MONTHLY" ? "month" : "year"}
              </p>
            )}
          </div>
          <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${isCancelled ? "bg-ember-100 text-ember-700" : "bg-verified-100 text-verified-700"}`}>
            {isCancelled ? "Cancellation scheduled" : subscription.status === "ACTIVE" ? "Active" : subscription.status.toLowerCase()}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-card bg-cloud-50 p-4">
            <p className="text-xs text-graphite-400">Started</p>
            <p className="mt-1 text-sm font-semibold text-graphite-900">{formatDate(subscription.startDate)}</p>
          </div>
          <div className="rounded-card bg-cloud-50 p-4">
            <p className="text-xs text-graphite-400">{isCancelled ? "Ends on" : "Next renewal"}</p>
            <p className="mt-1 text-sm font-semibold text-graphite-900">{formatDate(subscription.renewalDate)}</p>
          </div>
          <div className="rounded-card bg-cloud-50 p-4">
            <p className="text-xs text-graphite-400">Commission</p>
            <p className="mt-1 text-sm font-semibold text-graphite-900">{Number(subscription.plan.commissionRate)}%</p>
          </div>
        </div>

        {subscription.plan.features && subscription.plan.features.length > 0 && (
          <div className="mt-6 border-t border-graphite-100 pt-5">
            <p className="text-sm font-semibold text-graphite-900">Included with your plan</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {subscription.plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-graphite-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-verified-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isPaid && (
          <div className="mt-6 border-t border-graphite-100 pt-5">
            {isCancelled ? (
              <div className="flex flex-col gap-4 rounded-card border border-ember-200 bg-ember-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-graphite-900">Your plan is still active</p>
                  <p className="mt-1 text-sm text-graphite-600">You keep your paid features until {formatDate(subscription.renewalDate)}. No new charge will be made after that date.</p>
                </div>
                <button onClick={resume} disabled={busy} className="rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {busy ? "Updating…" : "Keep subscription"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-graphite-900">Want to cancel?</p>
                  <p className="mt-1 text-sm text-graphite-500">Your store will keep this plan until the paid period ends.</p>
                </div>
                <button onClick={cancel} disabled={busy} className="rounded-card border border-ember-200 px-4 py-2.5 text-sm font-semibold text-ember-700 hover:bg-ember-50 disabled:opacity-60">
                  {busy ? "Updating…" : "Cancel subscription"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
