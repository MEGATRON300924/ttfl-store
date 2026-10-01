"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Copy, ExternalLink, RefreshCw, TrendingUp, ShoppingBag, Eye, MousePointerClick, Star, Package, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

type Analytics = {
  generatedAt: string;
  cacheTtlSeconds: number;
  store: { id: string; storeId: string; name: string; slug: string; status: string; tier: string; verified: boolean; profileViews: number; createdAt: string };
  performance: { orders: number; grossSales: number; vendorEarnings: number; averageOrderValue: number; productViews: number; conversionRate: number; ordersByStatus: Record<string, number> };
  products: { total: number; views: number; byStatus: Record<string, number>; topSellers: Array<{ productId: string; productName: string; unitsSold: number; revenue: number }> };
  traffic: Array<{ type: string; source: string; count: number }>;
  reviews: { averageRating: number | null; recentReviews: number; badReviews: number; caution: boolean; threshold: number; windowDays: number };
  recentSales: Array<{ id: string; orderNumber: string; status: string; subtotal: number; vendorEarnings: number; createdAt: string }>;
  interpretationSignals: { lowTraffic: boolean; lowConversion: boolean; noPaidOrders: boolean; hasRecentReviewCaution: boolean };
};

export default function MaxAiAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [question, setQuestion] = useState("Why hasn't my store made many sales?");

  const load = useCallback(async (force = false) => {
    setError(null);
    setRefreshing(true);
    try {
      if (!storeId) throw new Error("No vendor store is connected to this account.");
      const result = await api.get<{ analytics: Analytics }>(`/api/analytics/max-ai/store/${encodeURIComponent(storeId)}${force ? "?refresh=1" : ""}`);
      setData(result.analytics);
      window.history.replaceState(null, "", `/vendor/dashboard/max-ai?storeId=${encodeURIComponent(result.analytics.store.id)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your Max AI analytics.");
    } finally {
      setRefreshing(false);
    }
  }, [storeId]);

  useEffect(() => {
    void api.get<{ membership: { vendorId?: string } | null }>("/api/vendor-staff/me")
      .then(({ membership }) => {
        const id = membership?.vendorId;
        if (!id) throw new Error("No vendor store is connected to this account.");
        setStoreId(id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Couldn't identify your store."));
  }, []);

  useEffect(() => {
    if (storeId) void load(false);
  }, [storeId, load]);

  async function copy(value: string) {
    await navigator.clipboard?.writeText(value);
  }

  function buildPrompt() {
    return `I am a TTFL Store vendor. My Store ID is ${data?.store.storeId}. Please analyze my store analytics and answer this question: ${question}`;
  }

  return (
    <div className="shell py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">MAX AI · Vendor Intelligence</p>
          <h1 className="mt-1 text-2xl font-bold text-graphite-900 dark:text-white">Store Analytics Intelligence</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-graphite-600 dark:text-graphite-400">A live, vendor-scoped view of the numbers Max AI can use to explain your store's performance.</p>
        </div>
        <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-card border border-graphite-300 px-4 py-2.5 text-sm font-semibold text-graphite-800 hover:bg-cloud-100 disabled:opacity-50 dark:border-graphite-700 dark:text-white dark:hover:bg-graphite-800"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh live data</button>
      </div>

      {error && <div role="alert" className="mt-5 rounded-card border border-ember-200 bg-ember-50 p-4 text-sm text-ember-700">{error}</div>}
      {!data && !error && <p className="mt-8 text-sm text-graphite-600">Loading live store analytics…</p>}

      {data && <>
        <section className="mt-6 rounded-2xl border border-graphite-200 bg-graphite-950 p-5 text-white shadow-card dark:border-graphite-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Your Store ID</p><div className="mt-2 flex flex-wrap items-center gap-2"><code className="rounded-lg bg-white/10 px-3 py-2 font-mono text-sm font-bold">{data.store.storeId}</code><button onClick={() => void copy(data.store.storeId)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/10"><Copy className="h-3.5 w-3.5"/>Copy</button></div><p className="mt-2 text-xs text-white/60">Max AI uses this ID to identify exactly which store it should analyze.</p></div>
            <div className="flex flex-wrap gap-2"><Link href={`/store/${encodeURIComponent(data.store.slug)}`} target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/10">View store <ExternalLink className="h-3.5 w-3.5"/></Link><a href="https://max-ai.name.ng/max" target="_blank" rel="noreferrer" onClick={() => void copy(buildPrompt())} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-graphite-900 hover:bg-cloud-100"><Bot className="h-3.5 w-3.5"/>Open Max AI</a></div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Eye} label="Store views" value={data.store.profileViews.toLocaleString()} />
          <Stat icon={Package} label="Product views" value={data.performance.productViews.toLocaleString()} />
          <Stat icon={ShoppingBag} label="Paid orders" value={data.performance.orders.toLocaleString()} />
          <Stat icon={TrendingUp} label="Conversion" value={`${data.performance.conversionRate}%`} />
          <Stat icon={TrendingUp} label="Gross sales" value={formatNaira(data.performance.grossSales)} />
          <Stat icon={TrendingUp} label="Vendor earnings" value={formatNaira(data.performance.vendorEarnings)} />
          <Stat icon={MousePointerClick} label="Average order" value={formatNaira(data.performance.averageOrderValue)} />
          <Stat icon={Star} label="Store rating" value={data.reviews.averageRating == null ? "—" : data.reviews.averageRating.toFixed(1)} />
        </section>

        {data.interpretationSignals.noPaidOrders && <Insight title="No paid orders recorded" body="Max AI should investigate traffic, product visibility, pricing, listing quality, trust signals, and the checkout or payment path before assuming a single cause." />}
        {data.interpretationSignals.lowTraffic && <Insight title="Traffic is currently limited" body={`Only ${data.performance.productViews.toLocaleString()} product views are recorded. Max AI should first investigate discoverability, store visibility, product presentation, search relevance and promotion activity.`} />}
        {data.interpretationSignals.lowConversion && <Insight title="Traffic is not turning into many orders" body={`The current conversion signal is ${data.performance.conversionRate}%. Max AI should compare product views with pricing, stock, reviews, traffic sources and checkout performance.`} />}
        {data.interpretationSignals.hasRecentReviewCaution && <Insight title="Recent review caution is active" body={`There are ${data.reviews.badReviews} recent bad-review signals in the last ${data.reviews.windowDays} days. Max AI should treat this as a customer-experience signal and inspect the category and review details before recommending changes.`} warning />}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Best-selling products">{data.products.topSellers.length ? data.products.topSellers.map((p) => <Row key={p.productId} left={p.productName} right={`${p.unitsSold} sold · ${formatNaira(p.revenue)}`} />) : <Empty text="No paid product sales yet." />}</Panel>
          <Panel title="Traffic sources">{data.traffic.length ? data.traffic.map((t, i) => <Row key={`${t.type}-${t.source}-${i}`} left={`${t.source} · ${t.type}`} right={String(t.count)} />) : <Empty text="No referral activity recorded yet." />}</Panel>
          <Panel title="Inventory">{Object.entries(data.products.byStatus).map(([status, count]) => <Row key={status} left={status.replace(/_/g, " ")} right={String(count)} />)}</Panel>
          <Panel title="Recent paid orders">{data.recentSales.length ? data.recentSales.map((sale) => <Row key={sale.id} left={`${sale.orderNumber} · ${sale.status}`} right={formatNaira(sale.subtotal)} />) : <Empty text="No paid orders yet." />}</Panel>
        </div>

        <section className="mt-8 rounded-2xl border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-ember-100 text-ember-700 dark:bg-ember-950/50 dark:text-ember-300"><Bot className="h-5 w-5"/></span><div><h2 className="font-bold text-graphite-900 dark:text-white">Ask Max AI about your store</h2><p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Copy the prepared question, then open Max AI. The analytics API is designed so the Botpress agent can retrieve the same store-scoped dataset automatically.</p></div></div><textarea value={question} onChange={(e)=>setQuestion(e.target.value)} rows={3} className="mt-4 w-full rounded-xl border border-graphite-200 bg-white p-3 text-sm text-graphite-900 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" /><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>void copy(buildPrompt())} className="inline-flex items-center gap-2 rounded-card border border-graphite-300 px-4 py-2.5 text-sm font-semibold hover:bg-cloud-100 dark:border-graphite-700 dark:hover:bg-graphite-800"><Copy className="h-4 w-4"/>Copy Max AI prompt</button><a href="https://max-ai.name.ng/max" target="_blank" rel="noreferrer" onClick={()=>void copy(buildPrompt())} className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800"><Bot className="h-4 w-4"/>Chat with Max AI</a></div></section>

        <p className="mt-5 text-[11px] text-graphite-500">Data generated {new Date(data.generatedAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}. The page caches analytics for about {data.cacheTtlSeconds} seconds and does not continuously poll Neon.</p>
      </>}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) { return <div className="rounded-card border border-graphite-200 bg-white p-4 dark:border-graphite-700 dark:bg-graphite-900"><Icon className="h-4 w-4 text-ember-600"/><p className="mt-3 text-xs text-graphite-500">{label}</p><p className="mt-1 font-mono text-lg font-bold text-graphite-900 dark:text-white">{value}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900"><h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-graphite-600 dark:text-graphite-300">{title}</h2><div className="flex flex-col gap-1.5">{children}</div></section>; }
function Row({ left, right }: { left: string; right: string }) { return <div className="flex items-center justify-between gap-3 rounded-lg border border-graphite-100 px-3 py-2 text-sm dark:border-graphite-800"><span className="truncate text-graphite-700 dark:text-graphite-200">{left}</span><span className="shrink-0 font-mono text-xs text-graphite-500">{right}</span></div>; }
function Empty({ text }: { text: string }) { return <p className="text-sm text-graphite-500">{text}</p>; }
function Insight({ title, body, warning = false }: { title: string; body: string; warning?: boolean }) { return <div className={`mt-4 rounded-card border p-4 ${warning ? "border-gold-200 bg-gold-50 dark:border-gold-500/30 dark:bg-gold-950/20" : "border-graphite-200 bg-cloud-50 dark:border-graphite-700 dark:bg-graphite-950"}`}><div className="flex items-start gap-3">{warning ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600"/> : <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-ember-600" />}<div><p className="text-sm font-bold text-graphite-900 dark:text-white">{title}</p><p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-300">{body}</p></div></div></div>; }
