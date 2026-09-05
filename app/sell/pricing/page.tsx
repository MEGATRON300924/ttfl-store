"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Crown, Gem, Store, Zap } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { ApiVendorPlan, VendorTier } from "@/lib/api-types";
import { formatNaira } from "@/lib/mock-data";

const FALLBACK_PLANS: Array<{ tier: VendorTier; name: string; price: number; commissionRate: number; productLimit: number | null; features: string[] }> = [
  { tier: "FREE", name: "Free", price: 0, commissionRate: 12, productLimit: 50, features: ["Standard public store profile"] },
  { tier: "PRO", name: "PRO", price: 2500, commissionRate: 8, productLimit: 500, features: ["Standard public store profile", "Store branding"] },
  { tier: "BUSINESS", name: "BUSINESS", price: 5000, commissionRate: 6, productLimit: 500, features: ["Standard public store profile", "Business Store badge eligible"] },
  { tier: "ENTERPRISE", name: "ENTERPRISE", price: 10000, commissionRate: 5, productLimit: null, features: ["Custom public profile", "Custom store link", "Profile themes and layouts", "Store gallery up to 12 images", "Enterprise Store badge eligible"] },
];

function normalizePlans(plans: ApiVendorPlan[]) {
  return plans.filter((plan) => plan.active).map((plan) => ({ tier: plan.tier, name: plan.name, price: Number(plan.price), commissionRate: Number(plan.commissionRate), productLimit: plan.productLimit, features: plan.features ?? [] }));
}

export default function VendorPricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") as VendorTier | null;
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_PLANS);

  useEffect(() => {
    void api.get<{ plans: ApiVendorPlan[] }>("/api/vendor-plans/").then((response) => {
      const next = normalizePlans(response.plans);
      if (next.length) setPlans(next);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (authLoading || !user || !selectedPlan) return;
    if (user.role === "VENDOR") router.replace(`/vendor/dashboard/subscription?plan=${selectedPlan}`);
    else router.replace(`/sell?plan=${selectedPlan}`);
  }, [authLoading, user, selectedPlan, router]);

  function choosePlan(tier: VendorTier) {
    if (authLoading) return;
    if (user?.role === "VENDOR") {
      router.push(`/vendor/dashboard/subscription?plan=${tier}`);
      return;
    }
    const destination = `/sell/pricing?plan=${tier}`;
    router.push(`/login?next=${encodeURIComponent(destination)}`);
  }

  return (
    <div className="min-h-screen bg-cloud-50">
      <section className="border-b border-graphite-200 bg-white"><div className="shell py-12 text-center sm:py-16"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ember-100 text-ember-600"><Store className="h-6 w-6" /></div><p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-ember-600">Sell on TTFL Store</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-graphite-900 sm:text-4xl">Choose your vendor plan</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-graphite-600">Pick the plan that fits your store. Commission is charged on successful marketplace checkout sales.</p></div></section>
      <div className="shell py-8 sm:py-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const featured = plan.tier === "BUSINESS";
            return <article key={plan.tier} className={`relative flex flex-col rounded-card border bg-white p-5 ${featured ? "border-ember-600 shadow-card" : "border-graphite-200"}`}>
              {featured && <span className="absolute right-4 top-4 rounded-tag bg-ember-100 px-2 py-1 text-[11px] font-bold text-ember-700">Popular</span>}
              <div className="flex items-center gap-2 text-sm font-bold text-graphite-900">{plan.tier === "ENTERPRISE" ? <Gem className="h-5 w-5 text-gold-600" /> : plan.tier === "BUSINESS" ? <Crown className="h-5 w-5 text-ember-600" /> : <Zap className="h-5 w-5 text-graphite-500" />}{plan.name}</div>
              <div className="mt-5"><span className="font-mono text-3xl font-bold text-graphite-900">{formatNaira(plan.price)}</span><span className="text-sm text-graphite-500">/month</span></div>
              <div className="mt-5 rounded-card bg-cloud-50 p-3"><p className="text-xs text-graphite-500">Commission</p><p className="mt-1 text-lg font-bold text-graphite-900">{plan.commissionRate}%</p></div>
              <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Product limit</p><p className="mt-1 text-sm font-semibold text-graphite-900">{plan.productLimit == null ? "Unlimited" : `${plan.productLimit} products`}</p></div>
              <ul className="mt-5 flex flex-1 flex-col gap-3 text-sm text-graphite-600">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-verified-600" />{feature}</li>)}</ul>
              <button type="button" onClick={() => choosePlan(plan.tier)} className={`mt-6 w-full rounded-card px-4 py-2.5 text-sm font-semibold ${featured ? "bg-ember-600 text-white hover:bg-ember-700" : "bg-graphite-900 text-white hover:bg-graphite-800"}`}>{user?.role === "VENDOR" ? "Manage plan" : "Choose plan"}</button>
            </article>;
          })}
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-card border border-graphite-200 bg-white p-5 text-sm leading-6 text-graphite-600"><strong className="text-graphite-900">How vendor payments work:</strong> customer checkout payments are split through Paystack. TTFL receives the commission for the vendor's plan and the vendor's share is settled to the vendor's connected Paystack subaccount.</div>
      </div>
    </div>
  );
}
