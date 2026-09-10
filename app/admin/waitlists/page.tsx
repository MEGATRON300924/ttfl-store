"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BellRing, RefreshCw, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type WaitlistProduct = { productId: string; name: string; slug: string; vendorName: string | null; count: number; latestJoinedAt: string | null };

export default function AdminWaitlistsPage() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<WaitlistProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true); setError(null);
    try { const result = await api.get<{ total: number; products: WaitlistProduct[] }>("/api/admin/waitlists"); setTotal(result.total); setProducts(result.products); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Could not load waitlists."); }
    finally { setBusy(false); }
  }
  useEffect(() => { if (user?.role === "ADMIN") void load(); }, [user]);

  if (loading) return <div className="shell py-16 text-center text-sm text-graphite-600">Loading...</div>;
  if (!user || user.role !== "ADMIN") return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900">Admin access only</h1></div>;

  return <div className="shell py-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/admin" className="inline-flex items-center gap-1 text-xs font-semibold text-graphite-600 hover:text-ember-600"><ArrowLeft className="h-3.5 w-3.5" /> Admin</Link><h1 className="mt-2 text-2xl font-bold text-graphite-900">Coming Soon waitlists</h1><p className="mt-1 text-sm text-graphite-600">See how many customers are waiting for each upcoming product.</p></div><button type="button" onClick={() => void load()} disabled={busy} className="inline-flex items-center gap-2 rounded-card border border-graphite-200 bg-white px-4 py-2.5 text-sm font-semibold text-graphite-900 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh</button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-card border border-ember-200 bg-ember-50 p-5"><div className="flex items-center gap-2 text-ember-700"><Users className="h-5 w-5" /><span className="text-sm font-semibold">Total people waiting</span></div><p className="mt-2 text-3xl font-bold text-graphite-900">{total.toLocaleString()}</p><p className="mt-1 text-xs text-graphite-600">Across all active Coming Soon products</p></div><div className="rounded-card border border-graphite-200 bg-white p-5"><div className="flex items-center gap-2 text-graphite-700"><BellRing className="h-5 w-5" /><span className="text-sm font-semibold">Active waitlists</span></div><p className="mt-2 text-3xl font-bold text-graphite-900">{products.filter((product) => product.count > 0).length}</p><p className="mt-1 text-xs text-graphite-600">Coming Soon products with at least one signup</p></div></div>
    {error && <p className="mt-4 rounded-card bg-ember-100 px-4 py-3 text-sm text-ember-700">{error}</p>}
    <section className="mt-6 overflow-hidden rounded-card border border-graphite-200 bg-white"><div className="border-b border-graphite-200 px-5 py-4"><h2 className="font-bold text-graphite-900">Product waitlists</h2></div><div className="divide-y divide-graphite-200">{products.length === 0 ? <div className="p-8 text-center"><Users className="mx-auto h-8 w-8 text-graphite-300" /><p className="mt-2 text-sm font-semibold text-graphite-900">No Coming Soon waitlists yet</p><p className="mt-1 text-xs text-graphite-600">Customer signups will appear here automatically.</p></div> : products.map((product) => <div key={product.productId} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><Link href={`/products/${product.slug}`} target="_blank" className="truncate text-sm font-bold text-graphite-900 hover:text-ember-600">{product.name}</Link><p className="mt-1 text-xs text-graphite-600">{product.vendorName || "Unknown vendor"}{product.latestJoinedAt ? ` · Latest signup ${new Date(product.latestJoinedAt).toLocaleString()}` : " · No signups yet"}</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ember-100 px-3 py-1.5 text-sm font-bold text-ember-700"><Users className="h-4 w-4" /> {product.count.toLocaleString()}</span></div>)}</div></section>
  </div>;
}
