"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import { TextField } from "@/components/text-field";
import type { ApiCoupon } from "@/lib/api-types";

export default function VendorCouponsPage() {
  const [coupons, setCoupons] = useState<ApiCoupon[] | null>(null);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE" as "PERCENTAGE" | "FIXED", value: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { coupons } = await api.get<{ coupons: ApiCoupon[] }>("/api/coupons/vendor");
    setCoupons(coupons);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/coupons/vendor", { code: form.code, type: form.type, value: Number(form.value) });
      setForm({ code: "", type: "PERCENTAGE", value: "" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create coupon");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell max-w-2xl py-8">
      <h1 className="text-xl font-bold text-graphite-900">Coupons</h1>
      <p className="mt-1 text-sm text-graphite-600">Discount codes that apply only to your store's items.</p>

      <form onSubmit={create} className="mt-6 flex flex-col gap-4 rounded-card border border-graphite-200 p-4">
        <TextField label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} />
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite-700">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })}
              className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value="PERCENTAGE">Percentage off</option>
              <option value="FIXED">Fixed amount off (₦)</option>
            </select>
          </label>
          <TextField label="Value" type="number" value={form.value} onChange={(v) => setForm({ ...form, value: v })} />
        </div>
        {error && <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create coupon"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2">
        {coupons === null ? (
          <p className="text-sm text-graphite-600">Loading…</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-graphite-600">No coupons yet.</p>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-card border border-graphite-200 p-3">
              <div>
                <p className="font-mono text-sm font-semibold text-graphite-900">{c.code}</p>
                <p className="text-xs text-graphite-600">
                  {c.type === "PERCENTAGE" ? `${Number(c.value)}% off` : `${formatNaira(Number(c.value))} off`} ·{" "}
                  {c._count?.redemptions ?? 0} used
                </p>
              </div>
              <span className={`rounded-tag px-2 py-1 text-xs font-medium ${c.active ? "bg-verified-100 text-verified-700" : "bg-cloud-100 text-graphite-500"}`}>
                {c.active ? "active" : "inactive"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
