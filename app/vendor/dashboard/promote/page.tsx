"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";

const PLACEMENTS = [
  { value: "HOMEPAGE", label: "Homepage" },
  { value: "TRENDING", label: "Trending section" },
  { value: "CATEGORY", label: "Category pages" },
  { value: "SEARCH", label: "Search results" },
] as const;

const DURATIONS = [1, 7, 14, 30] as const;

export default function VendorPromotePage() {
  const [products, setProducts] = useState<ApiProduct[] | null>(null);
  const [productId, setProductId] = useState("");
  const [placement, setPlacement] = useState<(typeof PLACEMENTS)[number]["value"]>("HOMEPAGE");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(7);
  const [storeDuration, setStoreDuration] = useState<(typeof DURATIONS)[number]>(7);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<{ products: ApiProduct[] }>("/api/products/me/list").then((r) => setProducts(r.products));
  }, []);

  async function promoteProduct() {
    if (!productId) {
      setError("Choose a product first");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { checkoutUrl } = await api.post<{ checkoutUrl: string }>("/api/featured/products/purchase", {
        productId,
        placement,
        durationDays: duration,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start payment");
      setSubmitting(false);
    }
  }

  async function promoteStore() {
    setError(null);
    setSubmitting(true);
    try {
      const { checkoutUrl } = await api.post<{ checkoutUrl: string }>("/api/featured/stores/purchase", {
        durationDays: storeDuration,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start payment");
      setSubmitting(false);
    }
  }

  return (
    <div className="shell max-w-2xl py-8">
      <h1 className="text-xl font-bold text-graphite-900">Promote</h1>
      <p className="mt-1 text-sm text-graphite-600">Pay to feature a product or your whole store in high-visibility spots.</p>

      {error && <p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      <section className="mt-6 rounded-card border border-graphite-200 p-5">
        <h2 className="text-sm font-bold text-graphite-900">Feature a product</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite-700">Product</span>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Choose a product</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite-700">Placement</span>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as typeof placement)}
              className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm"
            >
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite-700">Duration</span>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`rounded-card border px-3 py-1.5 text-sm ${
                    duration === d ? "border-ember-600 bg-ember-100 text-ember-700" : "border-graphite-200 text-graphite-700"
                  }`}
                >
                  {d} day{d > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </label>

          <button
            onClick={promoteProduct}
            disabled={submitting}
            className="mt-2 rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
          >
            {submitting ? "Redirecting…" : "Pay & feature product"}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-graphite-200 p-5">
        <h2 className="text-sm font-bold text-graphite-900">Feature your store</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite-700">Duration</span>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setStoreDuration(d)}
                  className={`rounded-card border px-3 py-1.5 text-sm ${
                    storeDuration === d ? "border-ember-600 bg-ember-100 text-ember-700" : "border-graphite-200 text-graphite-700"
                  }`}
                >
                  {d} day{d > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </label>
          <button
            onClick={promoteStore}
            disabled={submitting}
            className="mt-2 rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
          >
            {submitting ? "Redirecting…" : "Pay & feature store"}
          </button>
        </div>
      </section>
    </div>
  );
}
