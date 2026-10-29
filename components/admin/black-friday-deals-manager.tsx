"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleAlert, Flame, Plus, Search, Trash2, LoaderCircle, CheckCircle2, Tag } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import { formatNaira } from "@/lib/mock-data";

type Campaign = { startsAt: string; endsAt: string };
type FlashDeal = { id: string; productId: string; name: string; slug: string; price: number | string; salePrice: number | string; storeName: string; storeSlug: string; startsAt: string; endsAt: string; discountPercent: number | string; quantityCap?: number | null; remaining?: number | null };

function localDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
function isoDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function BlackFridayDealsManager({ campaign }: { campaign: Campaign }) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [deals, setDeals] = useState<FlashDeal[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("10");
  const [startsAt, setStartsAt] = useState(localDateTime(campaign.startsAt));
  const [endsAt, setEndsAt] = useState(localDateTime(campaign.endsAt));
  const [quantityCap, setQuantityCap] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [productResult, dealResult] = await Promise.allSettled([
      api.get<{ items: ApiProduct[] }>("/api/products?limit=100&sort=newest"),
      api.get<{ deals: FlashDeal[] }>("/api/flash-deals"),
    ]);
    if (productResult.status === "fulfilled") setProducts(productResult.value.items.filter((product) => product.status === "ACTIVE" && !product.comingSoon));
    if (dealResult.status === "fulfilled") setDeals(dealResult.value.deals ?? []);
    if (productResult.status === "rejected" && dealResult.status === "rejected") setError("Could not load products or current flash deals.");
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => !term || product.name.toLowerCase().includes(term) || product.vendor.storeName.toLowerCase().includes(term)).slice(0, 8);
  }, [products, search]);

  async function createDeal(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedProductId) { setError("Choose a product first."); return; }
    const percent = Number(discountPercent);
    if (!Number.isFinite(percent) || percent < 1 || percent > 99) { setError("Discount must be between 1% and 99%."); return; }
    const startIso = isoDateTime(startsAt);
    const endIso = isoDateTime(endsAt);
    if (!startIso || !endIso || new Date(endIso) <= new Date(startIso)) { setError("Choose an end date after the start date."); return; }
    setSaving(true); setMessage(""); setError("");
    try {
      await api.post("/api/flash-deals/admin", {
        productId: selectedProductId,
        discountPercent: percent,
        startsAt: startIso,
        endsAt: endIso,
        ...(quantityCap.trim() ? { quantityCap: Number(quantityCap) } : {}),
      });
      setMessage("Flash deal saved. It will appear when its start time is reached, provided it remains eligible.");
      setSelectedProductId(""); setSearch(""); setDiscountPercent("10"); setQuantityCap("");
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not create the deal.");
    } finally { setSaving(false); }
  }

  async function removeDeal(deal: FlashDeal) {
    if (!window.confirm(`Remove the flash deal for “${deal.name}”? This will remove the promotion, not the product.`)) return;
    setRemovingId(deal.id); setError(""); setMessage("");
    try {
      await api.delete(`/api/flash-deals/admin/${deal.id}`);
      setDeals((current) => current.filter((item) => item.id !== deal.id));
      setMessage(`Promotion removed for ${deal.name}.`);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not remove the promotion.");
    } finally { setRemovingId(null); }
  }

  return (
    <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-ember-100 text-ember-800"><Tag className="h-5 w-5" /></span><div><h2 className="font-bold text-graphite-900">Campaign deal management</h2><p className="mt-1 text-sm leading-6 text-graphite-600">Create a scheduled discount using the existing secure flash-deal pricing flow. The backend validates the discount and campaign dates; products and orders remain unchanged when the campaign is switched off.</p></div></div>
      <form onSubmit={createDeal} className="mt-5 rounded-card border border-graphite-200 bg-cloud-50 p-4">
        <h3 className="text-sm font-bold text-graphite-900">Schedule a promotional deal</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="relative sm:col-span-2">
            <label htmlFor="bf-product-search" className="block text-sm font-medium text-graphite-700">Product</label>
            <div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" /><input id="bf-product-search" value={selectedProduct ? selectedProduct.name : search} onChange={(event) => { setSelectedProductId(""); setSearch(event.target.value); setDropdownOpen(true); }} onFocus={() => setDropdownOpen(true)} placeholder="Search product or store…" autoComplete="off" className="w-full rounded-card border border-graphite-200 bg-white py-2.5 pl-9 pr-3 text-sm text-graphite-900 outline-none focus:border-ember-600" /></div>
            {dropdownOpen && !selectedProduct && <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-card border border-graphite-200 bg-white p-1 shadow-lg">{filteredProducts.length ? filteredProducts.map((product) => <button type="button" key={product.id} onClick={() => { setSelectedProductId(product.id); setSearch(""); setDropdownOpen(false); }} className="flex w-full items-center justify-between gap-3 rounded-[6px] px-3 py-2.5 text-left hover:bg-cloud-50"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-graphite-900">{product.name}</span><span className="block truncate text-xs text-graphite-500">{product.vendor.storeName}</span></span><span className="shrink-0 font-mono text-xs text-graphite-700">{formatNaira(Number(product.price))}</span></button>) : <p className="px-3 py-4 text-sm text-graphite-500">No matching available products.</p>}</div>}
            {selectedProduct && <button type="button" onClick={() => { setSelectedProductId(""); setSearch(""); setDropdownOpen(true); }} className="mt-2 text-xs font-semibold text-ember-700">Change product</button>}
            {dropdownOpen && <button type="button" aria-label="Close product search" onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-10 cursor-default" />}
          </div>
          <label className="block text-sm font-medium text-graphite-700">Discount percentage<input type="number" min="1" max="99" step="1" required value={discountPercent} onChange={(event) => setDiscountPercent(event.target.value)} className="mt-2 block w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 font-mono text-sm text-graphite-900 outline-none focus:border-ember-600" /></label>
          <label className="block text-sm font-medium text-graphite-700">Optional quantity limit<input type="number" min="1" step="1" value={quantityCap} onChange={(event) => setQuantityCap(event.target.value)} placeholder="No limit" className="mt-2 block w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 font-mono text-sm text-graphite-900 outline-none focus:border-ember-600" /></label>
          <label className="block text-sm font-medium text-graphite-700">Starts at<input type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-2 block w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" /></label>
          <label className="block text-sm font-medium text-graphite-700">Ends at<input type="datetime-local" required value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="mt-2 block w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" /></label>
        </div>
        {selectedProduct && <p className="mt-3 text-xs text-graphite-600">Sale price preview: <strong className="font-mono text-graphite-900">{formatNaira(Number(selectedProduct.price) * (1 - Number(discountPercent || 0) / 100))}</strong> from {formatNaira(Number(selectedProduct.price))}. The server calculates and stores the actual sale price.</p>}
        <button type="submit" disabled={saving || loading} className="mt-4 inline-flex items-center justify-center gap-2 rounded-card bg-graphite-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{saving ? "Saving deal…" : "Schedule deal"}</button>
      </form>
      {message && <p role="status" className="mt-4 flex items-start gap-2 rounded-card bg-verified-50 px-3 py-2.5 text-sm text-verified-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>}
      {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-card bg-ember-50 px-3 py-2.5 text-sm text-ember-700"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      <div className="mt-6"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-graphite-900">Currently live flash deals</h3><button type="button" onClick={() => void load()} className="text-xs font-semibold text-ember-700 hover:underline">Refresh</button></div>
        {loading ? <p className="py-5 text-sm text-graphite-500">Loading deals…</p> : deals.length === 0 ? <p className="mt-3 rounded-card border border-dashed border-graphite-300 px-4 py-6 text-center text-sm text-graphite-500">No live flash deals right now. Scheduled deals appear here when they start.</p> : <div className="mt-3 divide-y divide-graphite-200 border-t border-graphite-200">{deals.map((deal) => <div key={deal.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold text-graphite-900">{deal.name}</p><p className="mt-1 text-xs text-graphite-600">{deal.storeName} · {Number(deal.discountPercent)}% off · {deal.remaining == null ? "No quantity cap" : `${deal.remaining} remaining`}</p><p className="mt-1 font-mono text-xs"><span className="font-bold text-ember-700">{formatNaira(Number(deal.salePrice))}</span> <span className="text-graphite-400 line-through">{formatNaira(Number(deal.price))}</span></p></div><button type="button" onClick={() => void removeDeal(deal)} disabled={removingId === deal.id} className="inline-flex w-fit items-center gap-2 rounded-card border border-ember-200 px-3 py-2 text-xs font-semibold text-ember-700 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />{removingId === deal.id ? "Removing…" : "Remove deal"}</button></div>)}</div>}
      </div>
    </section>
  );
}
