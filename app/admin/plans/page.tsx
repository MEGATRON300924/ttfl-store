"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiVendorPlan } from "@/lib/api-types";

const TIERS = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"] as const;
const PROFILE_FEATURES: Record<(typeof TIERS)[number], string[]> = {
  FREE: ["Standard public store profile"],
  PRO: ["Standard public store profile", "Store branding"],
  BUSINESS: ["Standard public store profile", "Business Store badge eligible"],
  ENTERPRISE: ["Custom public profile", "Custom store link", "Profile themes and layouts", "Store gallery up to 12 images", "Enterprise Store badge eligible"],
};

export default function AdminVendorPlansPage() {
  const [plans, setPlans] = useState<ApiVendorPlan[] | null>(null);
  useEffect(() => { api.get<{ plans: ApiVendorPlan[] }>("/api/vendor-plans").then((r) => setPlans(r.plans)); }, []);
  return <div className="shell py-8"><h1 className="text-xl font-bold text-graphite-900">Vendor plans</h1><p className="mt-1 text-sm text-graphite-600">Pricing, limits, commission rates, and public storefront capabilities per tier.</p>{plans === null ? <p className="mt-6 text-sm text-graphite-600">Loading…</p> : <div className="mt-6 grid gap-4 sm:grid-cols-2">{TIERS.map((tier) => <PlanEditor key={tier} tier={tier} plan={plans.find((p) => p.tier === tier)} />)}</div>}</div>;
}

function PlanEditor({ tier, plan }: { tier: (typeof TIERS)[number]; plan?: ApiVendorPlan }) {
  const [name, setName] = useState(plan?.name ?? tier);
  const [price, setPrice] = useState(plan ? String(plan.price) : "0");
  const [productLimit, setProductLimit] = useState(plan?.productLimit != null ? String(plan.productLimit) : "");
  const [commissionRate, setCommissionRate] = useState(plan ? String(plan.commissionRate) : "5");
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null);
  async function save() { setError(null); setSaving(true); setSaved(false); try { await api.put(`/api/vendor-plans/${tier}`, { name, price: Number(price), billingPeriod: "MONTHLY", productLimit: productLimit ? Number(productLimit) : null, commissionRate: Number(commissionRate) }); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't save"); } finally { setSaving(false); } }
  return <div className="rounded-card border border-graphite-200 p-4"><p className="font-mono text-xs font-medium uppercase tracking-wide text-graphite-400">{tier}</p><div className="mt-2 flex flex-col gap-3"><label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700">Display name</span><input value={name} onChange={(e) => setName(e.target.value)} className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm" /></label><div className="grid grid-cols-2 gap-3"><label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700">Price (₦/month)</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm" /></label><label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700">Commission %</span><input type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm" /></label></div><label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700">Product limit (blank = unlimited)</span><input type="number" value={productLimit} onChange={(e) => setProductLimit(e.target.value)} className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm" /></label><div className="rounded-[7px] bg-cloud-100 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Public profile capabilities</p><ul className="mt-2 space-y-1 text-xs text-graphite-700">{PROFILE_FEATURES[tier].map((feature) => <li key={feature}>• {feature}</li>)}</ul></div>{error && <p className="text-xs text-ember-600">{error}</p>}<button onClick={save} disabled={saving} className="rounded-card bg-graphite-900 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60">{saving ? "Saving…" : saved ? "Saved ✓" : "Save"}</button></div></div>;
}
