"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

type Overview = {
  users: { total: number };
  vendors: { total: number; approved: number };
  products: { total: number; active: number };
  orders: { total: number; paid: number; refunded: number };
  gmv: number;
  totalDiscountsGiven: number;
  ttflCommissionRevenue: number;
  vendorEarnings: number;
  subscriptionRevenue: number;
  featuredProductRevenue: number;
  featuredStoreRevenue: number;
  referralActivity: { whatsappLeads: number; externalClicks: number };
};

type CommissionCenter = {
  directSales: { totalSales: number; totalCommission: number; orderCount: number };
  referralTraffic: { type: string; count: number }[];
  subscriptions: { revenue: number; count: number };
  featuredProducts: { revenue: number; count: number };
  featuredStores: { revenue: number; count: number };
};

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [commission, setCommission] = useState<CommissionCenter | null>(null);

  useEffect(() => {
    api.get<{ overview: Overview }>("/api/analytics/admin/overview").then((r) => setOverview(r.overview));
    api.get<CommissionCenter>("/api/analytics/admin/commission-center").then(setCommission);
  }, []);

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Analytics</h1>

      {overview && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Users" value={overview.users.total.toLocaleString()} />
          <Stat label="Vendors (approved)" value={`${overview.vendors.total} (${overview.vendors.approved})`} />
          <Stat label="Products (active)" value={`${overview.products.total} (${overview.products.active})`} />
          <Stat label="Orders (paid)" value={`${overview.orders.total} (${overview.orders.paid})`} />
          <Stat label="GMV" value={formatNaira(overview.gmv)} />
          <Stat label="TTFL commission revenue" value={formatNaira(overview.ttflCommissionRevenue)} />
          <Stat label="Vendor earnings paid out" value={formatNaira(overview.vendorEarnings)} />
          <Stat label="Discounts given" value={formatNaira(overview.totalDiscountsGiven)} />
          <Stat label="Subscription revenue" value={formatNaira(overview.subscriptionRevenue)} />
          <Stat label="Featured product revenue" value={formatNaira(overview.featuredProductRevenue)} />
          <Stat label="Featured store revenue" value={formatNaira(overview.featuredStoreRevenue)} />
          <Stat label="Refunded orders" value={overview.orders.refunded.toLocaleString()} />
          <Stat label="WhatsApp leads" value={overview.referralActivity.whatsappLeads.toLocaleString()} />
          <Stat label="External link clicks" value={overview.referralActivity.externalClicks.toLocaleString()} />
        </div>
      )}

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-graphite-600">Commission center</h2>
      {commission && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Direct sales</p>
            <p className="font-mono text-lg font-bold text-graphite-900">{formatNaira(commission.directSales.totalSales)}</p>
            <p className="text-xs text-graphite-600">
              Commission: {formatNaira(commission.directSales.totalCommission)} · {commission.directSales.orderCount} orders
            </p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Subscriptions</p>
            <p className="font-mono text-lg font-bold text-graphite-900">{formatNaira(commission.subscriptions.revenue)}</p>
            <p className="text-xs text-graphite-600">{commission.subscriptions.count} payments</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Featured products</p>
            <p className="font-mono text-lg font-bold text-graphite-900">{formatNaira(commission.featuredProducts.revenue)}</p>
            <p className="text-xs text-graphite-600">{commission.featuredProducts.count} listings</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Featured stores</p>
            <p className="font-mono text-lg font-bold text-graphite-900">{formatNaira(commission.featuredStores.revenue)}</p>
            <p className="text-xs text-graphite-600">{commission.featuredStores.count} listings</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Referral traffic</p>
            {commission.referralTraffic.map((r) => (
              <p key={r.type} className="text-xs text-graphite-700">
                {r.type.replace(/_/g, " ").toLowerCase()}: {r.count}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-graphite-200 p-4">
      <p className="text-xs text-graphite-600">{label}</p>
      <p className="mt-0.5 font-mono text-base font-bold text-graphite-900">{value}</p>
    </div>
  );
}
