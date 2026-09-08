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
  const [sponsoredProducts, setSponsoredProducts] = useState<ApiProduct[]>([]);
  const [productId, setProductId] = useState("");
  const [placement, setPlacement] = useState<(typeof PLACEMENTS)[number]["value"]>("HOMEPAGE");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(7);
  const [storeDuration, setStoreDuration] = useState<(typeof DURATIONS)[number]>(7);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sponsorBusy, setSponsorBusy] = useState<string | null>(null);

  async function load() {
    const [productRes, sponsoredRes] = await Promise.all([
      api.get<{ products: ApiProduct[] }>("/api/products/me/list"),
      api.get<{ products: ApiProduct[] }>("/api/products/me/sponsored"),
    ]);
    setProducts(productRes.products);
    setSponsoredProducts(sponsoredRes.products.filter((p) => p.sponsored));
  }
  useEffect(() => { void load(); }, []);

  async function setSponsored(id: string, sponsored: boolean) {
    setSponsorBusy(id); setError(null);
    try { await api.patch(`/api/products/${id}/sponsored`, { sponsored }); await load(); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't update sponsored status"); }
    finally { setSponsorBusy(null); }
  }

  async function promoteProduct() {
    if (!productId) { setError("Choose a product first"); return; }
    setError(null); setSubmitting(true);
    try { const { checkoutUrl } = await api.post<{ checkoutUrl: string }>("/api/featured/products/purchase", { productId, placement, durationDays: duration }); window.location.href = checkoutUrl; }
    catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't start payment"); setSubmitting(false); }
  }

  async function promoteStore() {
    setError(null); setSubmitting(true);
    try { const { checkoutUrl } = await api.post<{ checkoutUrl: string }>("/api/featured/stores/purchase", { durationDays: storeDuration }); window.location.href = checkoutUrl; }
    catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't start payment"); setSubmitting(false); }
  }

  return (
    <div className="shell max-w-3xl py-8">
      <h1 className="text-xl font-bold text-graphite-900">Promote</h1>
      <p className="mt-1 text-sm text-graphite-600">Paid plans include sponsored products in search. You can also buy premium featured placements for extra visibility.</p>
      {error && <p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      <section className="mt-6 rounded-card border border-graphite-200 p-5">
        <h2 className="text-sm font-bold text-graphite-900">Sponsored products — included with paid plans</h2>
        <p className="mt-1 text-sm text-graphite-600">Turn sponsorship on for products in your store. Sponsored products are clearly labelled and ranked before normal matching products in search.</p>
        <div className="mt-4 grid gap-3">
          {products?.map((product) => {
            const isSponsored = sponsoredProducts.some((p) => p.id === product.id);
            return <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[7px] border border-graphite-200 p-3"><div><p className="text-sm font-semibold text-graphite-900">{product.name}</p><p className="text-xs text-graphite-500">{product.status} · ₦{Number(product.price).toLocaleString("en-NG")}</p></div><button onClick={() => void setSponsored(product.id, !isSponsored)} disabled={sponsorBusy === product.id} className={`rounded-card px-3 py-2 text-xs font-semibold ${isSponsored ? "border border-graphite-300 bg-white text-graphite-800" : "bg-ember-600 text-white"}`}>{sponsorBusy === product.id ? "Saving…" : isSponsored ? "Remove sponsored" : "Sponsor product"}</button></div>;
          })}
          {products?.length === 0 && <p className="text-sm text-graphite-500">Add a product to your store first.</p>}
        </div>
      </section>

      <section className="mt-6 rounded-card border border-graphite-200 p-5">
        <h2 className="text-sm font-bold text-graphite-900">Premium featured product</h2>
        <p className="mt-1 text-sm text-graphite-600">Pay to feature a product in high-visibility spots for a selected duration.</p>
        <div className="mt-3 flex flex-col gap-3">
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm"><option value="">Choose a product</option>{products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <select value={placement} onChange={(e) => setPlacement(e.target.value as typeof placement)} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm">{PLACEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
          <div className="flex gap-2">{DURATIONS.map((d) => <button key={d} type="button" onClick={() => setDuration(d)} className={`rounded-card border px-3 py-1.5 text-sm ${duration === d ? "border-ember-600 bg-ember-100 text-ember-700" : "border-graphite-200 text-graphite-700"}`}>{d} day{d > 1 ? "s" : ""}</button>)}</div>
          <button onClick={promoteProduct} disabled={submitting} className="rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Redirecting…" : "Pay & feature product"}</button>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-graphite-200 p-5">
        <h2 className="text-sm font-bold text-graphite-900">Premium featured store</h2>
        <p className="mt-1 text-sm text-graphite-600">Pay to feature your whole store in high-visibility spots.</p>
        <div className="mt-3 flex flex-col gap-3"><div className="flex gap-2">{DURATIONS.map((d) => <button key={d} type="button" onClick={() => setStoreDuration(d)} className={`rounded-card border px-3 py-1.5 text-sm ${storeDuration === d ? "border-ember-600 bg-ember-100 text-ember-700" : "border-graphite-200 text-graphite-700"}`}>{d} day{d > 1 ? "s" : ""}</button>)}</div><button onClick={promoteStore} disabled={submitting} className="rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Redirecting…" : "Pay & feature store"}</button></div>
      </section>
    </div>
  );
}
