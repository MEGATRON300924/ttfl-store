"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

type Overview = {
  storeViews: number;
  productViews: number;
  whatsappClicks: number;
  externalClicks: number;
  orders: number;
  revenue: number;
  grossSales: number;
  conversionRate: number;
};

type BestProduct = { productId: string; productName: string; unitsSold: number; revenue: number };
type TrafficSource = { source: string; count: number };

export default function VendorAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [bestProducts, setBestProducts] = useState<BestProduct[] | null>(null);
  const [sources, setSources] = useState<TrafficSource[] | null>(null);

  useEffect(() => {
    api.get<{ overview: Overview }>("/api/analytics/vendor/overview").then((r) => setOverview(r.overview));
    api.get<{ products: BestProduct[] }>("/api/analytics/vendor/best-products").then((r) => setBestProducts(r.products));
    api.get<{ sources: TrafficSource[] }>("/api/analytics/vendor/traffic-sources").then((r) => setSources(r.sources));
  }, []);

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Analytics</h1>

      {overview && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Store views" value={overview.storeViews.toLocaleString()} />
          <Stat label="Product views" value={overview.productViews.toLocaleString()} />
          <Stat label="WhatsApp clicks" value={overview.whatsappClicks.toLocaleString()} />
          <Stat label="External clicks" value={overview.externalClicks.toLocaleString()} />
          <Stat label="Orders" value={overview.orders.toLocaleString()} />
          <Stat label="Revenue (after commission)" value={formatNaira(overview.revenue)} />
          <Stat label="Gross sales" value={formatNaira(overview.grossSales)} />
          <Stat label="Conversion rate" value={`${overview.conversionRate}%`} />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-graphite-600">Best-performing products</h2>
          {bestProducts === null ? (
            <p className="text-sm text-graphite-600">Loading…</p>
          ) : bestProducts.length === 0 ? (
            <p className="text-sm text-graphite-600">No sales yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {bestProducts.map((p) => (
                <div key={p.productId} className="flex items-center justify-between rounded-card border border-graphite-200 px-3 py-2 text-sm">
                  <span className="truncate pr-2 text-graphite-900">{p.productName}</span>
                  <span className="shrink-0 font-mono text-graphite-600">
                    {p.unitsSold} sold · {formatNaira(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-graphite-600">Traffic sources</h2>
          {sources === null ? (
            <p className="text-sm text-graphite-600">Loading…</p>
          ) : sources.length === 0 ? (
            <p className="text-sm text-graphite-600">No referral clicks recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sources.map((s) => (
                <div key={s.source} className="flex items-center justify-between rounded-card border border-graphite-200 px-3 py-2 text-sm">
                  <span className="text-graphite-900">{s.source}</span>
                  <span className="font-mono text-graphite-600">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-graphite-200 p-4">
      <p className="text-xs text-graphite-600">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-bold text-graphite-900">{value}</p>
    </div>
  );
}
