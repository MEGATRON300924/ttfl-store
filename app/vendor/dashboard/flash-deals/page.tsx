"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

type Product = { id: string; name: string; price: number | string; stock: number; status: string };
type Deal = { id: string; productId: string; name: string; price: number; salePrice: number; discountPercent: number; startsAt: string; endsAt: string; active: boolean };

export default function FlashDealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [productId, setProductId] = useState("");
  const [discount, setDiscount] = useState("20");
  const [endsAt, setEndsAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [productResponse, dealResponse] = await Promise.all([
      api.get<{ products?: Product[]; items?: Product[] }>("/api/products/me/list"),
      api.get<{ deals: Deal[] }>("/api/flash-deals/mine"),
    ]);
    setProducts(productResponse.products ?? productResponse.items ?? []);
    setDeals(dealResponse.deals);
  }

  useEffect(() => { void load(); }, []);

  async function createDeal(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      const end = new Date(endsAt);
      if (!productId || !Number.isFinite(end.getTime()) || end <= new Date()) throw new Error("Choose a product and a future end time.");
      await api.post("/api/flash-deals/mine", { productId, discountPercent: Number(discount), startsAt: new Date().toISOString(), endsAt: end.toISOString() });
      setProductId(""); setDiscount("20"); setEndsAt(""); await load();
    } catch (err) { setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Could not create flash deal."); }
    finally { setBusy(false); }
  }

  async function removeDeal(id: string) { await api.delete(`/api/flash-deals/mine/${id}`); await load(); }

  return <div className="shell py-8">
    <Link href="/vendor/dashboard" className="text-sm font-semibold text-ember-600">← Dashboard</Link>
    <h1 className="mt-3 text-2xl font-bold text-graphite-900">Flash deals</h1>
    <p className="mt-1 max-w-2xl text-sm text-graphite-600">Flash deals are free for every TTFL Store. Pick an existing product, set a discount and choose when the deal ends.</p>
    <form onSubmit={createDeal} className="mt-6 grid gap-4 rounded-card border border-graphite-200 bg-white p-5 sm:grid-cols-4">
      <label className="text-sm sm:col-span-2"><span className="mb-1 block font-medium">Product</span><select value={productId} onChange={e => setProductId(e.target.value)} required className="w-full rounded-[7px] border border-graphite-200 px-3 py-2"><option value="">Choose a product</option>{products.filter(p => p.status === "ACTIVE" && p.stock > 0).map(p => <option key={p.id} value={p.id}>{p.name} — {formatNaira(Number(p.price))}</option>)}</select></label>
      <label className="text-sm"><span className="mb-1 block font-medium">Discount %</span><input type="number" min="1" max="99" value={discount} onChange={e => setDiscount(e.target.value)} required className="w-full rounded-[7px] border border-graphite-200 px-3 py-2" /></label>
      <label className="text-sm"><span className="mb-1 block font-medium">Ends</span><input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} required className="w-full rounded-[7px] border border-graphite-200 px-3 py-2" /></label>
      {error && <p className="sm:col-span-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
      <button disabled={busy} className="sm:col-span-4 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Start flash deal"}</button>
    </form>
    <div className="mt-6 grid gap-3">{deals.map(deal => <div key={deal.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-graphite-200 bg-white p-4"><div><p className="font-semibold text-graphite-900">{deal.name}</p><p className="text-sm text-graphite-600">{deal.discountPercent}% off · {formatNaira(Number(deal.salePrice))} · ends {new Date(deal.endsAt).toLocaleString()}</p></div><button onClick={() => void removeDeal(deal.id)} className="rounded-card border border-graphite-300 px-3 py-2 text-sm font-semibold text-graphite-800">Remove</button></div>)}{deals.length === 0 && <div className="rounded-card border border-dashed border-graphite-300 p-8 text-center text-sm text-graphite-600">No flash deals yet.</div>}</div>
  </div>;
}
