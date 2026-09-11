"use client";

import type { FormEvent } from "react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogIn, MapPin, Package } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { ApiTrackedVendorOrder, ApiTrackingResult } from "@/lib/api-types";
import TrackingVehicleAvatar from "@/components/tracking-vehicle-avatar";

const checkpoints = [
  "Order confirmed",
  "Order is being packaged",
  "Order is being shipped",
  "Order just arrived Destination country",
  "Order is out for delivery",
];

function estimatedDate(createdAt: string, days: number) {
  const date = new Date(createdAt);
  date.setTime(date.getTime() + days * 86400000);
  return date;
}

function getEstimatedDeliveryDate(vendorOrder: ApiTrackedVendorOrder, createdAt: string) {
  if (vendorOrder.estimatedDeliveryAt) return new Date(vendorOrder.estimatedDeliveryAt);
  const days = vendorOrder.items[0]?.estimatedDeliveryDays ?? 7;
  return estimatedDate(createdAt, days);
}

function TrackingMap({ vendorOrder, createdAt }: { vendorOrder: ApiTrackedVendorOrder; createdAt: string }) {
  const current = vendorOrder.currentCheckpoint;
  const estimate = getEstimatedDeliveryDate(vendorOrder, createdAt);
  const currentEvent = vendorOrder.checkpoints[current - 1]?.event;

  return (
    <div className="overflow-hidden rounded-card border border-graphite-200 bg-cloud-100">
      <div className="relative h-64 sm:h-72">
        <svg viewBox="0 0 800 360" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M70 280 C170 210 180 120 300 150 S440 290 530 180 S650 100 735 65" fill="none" stroke="currentColor" strokeWidth="7" strokeDasharray="10 13" className="text-graphite-300" />
          <path d="M70 280 C170 210 180 120 300 150 S440 290 530 180 S650 100 735 65" fill="none" stroke="currentColor" strokeWidth="7" strokeDasharray="10 13" strokeDashoffset={Math.max(0, 80 - current * 16)} className="text-ember-600" />
          {[70, 235, 400, 565, 735].map((x, index) => (
            <g key={x} transform={`translate(${x} ${[280, 145, 220, 150, 65][index]})`}>
              <circle r="17" className={index + 1 <= current ? "fill-ember-600" : "fill-white"} stroke="currentColor" strokeWidth="3" />
              <text textAnchor="middle" dy="5" fontSize="12" className={index + 1 <= current ? "fill-white" : "fill-graphite-600"}>{index + 1}</text>
            </g>
          ))}
        </svg>
        <div className="absolute left-4 top-4 rounded-card border border-graphite-200 bg-white px-3 py-2 text-xs font-semibold text-graphite-700">TTFL delivery route</div>
        {currentEvent && <div className="absolute bottom-4 left-4 rounded-card border border-graphite-200 bg-white/95 px-3 py-2"><TrackingVehicleAvatar type={currentEvent.avatar} size="sm" /></div>}
        <div className="absolute bottom-4 right-4 rounded-card border border-graphite-200 bg-white px-3 py-2 text-xs text-graphite-600"><span className="font-semibold text-graphite-900">Estimated:</span>{" "}{estimate.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
      </div>
    </div>
  );
}

function VendorTracking({ vendorOrder, createdAt }: { vendorOrder: ApiTrackedVendorOrder; createdAt: string }) {
  const current = vendorOrder.currentCheckpoint;
  const estimate = getEstimatedDeliveryDate(vendorOrder, createdAt);
  const lastEvent = vendorOrder.checkpoints.find((item) => item.checkpoint === current)?.event;

  return (
    <section className="rounded-card border border-graphite-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-wide text-ember-600">{vendorOrder.vendor.storeName}</p><h2 className="mt-1 text-lg font-bold text-graphite-900">Delivery progress</h2></div>
        <div className="text-right"><p className="text-xs text-graphite-500">Estimated delivery</p><p className="text-sm font-bold text-graphite-900">{estimate.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>
      </div>
      <div className="mt-5"><TrackingMap vendorOrder={vendorOrder} createdAt={createdAt} /></div>
      {lastEvent && <div className="mt-4 flex items-center justify-between gap-4 rounded-card border border-graphite-200 bg-cloud-100 p-4"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember-600"/><div><p className="text-xs font-bold text-graphite-900">Latest update</p><p className="mt-0.5 text-sm text-graphite-700">{lastEvent.description || lastEvent.title}</p></div></div><TrackingVehicleAvatar type={lastEvent.avatar} size="md" /></div>}
      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        {checkpoints.map((title, index) => {
          const number = index + 1;
          const event = vendorOrder.checkpoints[index]?.event;
          return <div key={title} className={`rounded-card border p-3 ${number <= current ? "border-ember-600 bg-ember-100" : "border-graphite-200"}`}>
            <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-ember-600">0{number}</span>{number === 5 && event && <TrackingVehicleAvatar type={event.avatar} size="sm" />}</div>
            <p className="mt-2 text-xs font-semibold leading-5 text-graphite-900">{title}</p>
            {event?.description && <p className="mt-1 text-[11px] leading-4 text-graphite-600">{event.description}</p>}
            {event?.trackingUrl && <a href={event.trackingUrl} target="_blank" rel="noreferrer" className="mt-2 block text-[11px] font-semibold text-ember-600">Open tracking link</a>}
            {event?.riderName && <p className="mt-2 text-[11px] text-graphite-600">Rider: {event.riderName}{event.riderPhone ? ` · ${event.riderPhone}` : ""}</p>}
          </div>;
        })}
      </div>
    </section>
  );
}

const demoResult = {
  orderNumber: "TTFL-DEMO-2026",
  createdAt: new Date().toISOString(),
  paymentStatus: "PAID",
  vendorOrders: [{
    id: "demo-vendor-order",
    status: "OUT_FOR_DELIVERY",
    estimatedDeliveryAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    currentCheckpoint: 5,
    vendor: { id: "demo-vendor", storeName: "TTFL Demo Store", storeSlug: "ttfl-demo-store", verified: true },
    items: [{ id: "demo-item", productId: "demo-product", publicProductId: "TTFL-DEMO-PRODUCT", productName: "Demo Wireless Headphones", quantity: 1, estimatedDeliveryDays: 2 }],
    checkpoints: [
      { checkpoint: 1, title: "Order confirmed", event: { checkpoint: 1, title: "Order confirmed", description: "Your demo order was confirmed.", avatar: "package" } },
      { checkpoint: 2, title: "Order is being packaged", event: { checkpoint: 2, title: "Order is being packaged", description: "The vendor is preparing the package.", avatar: "package" } },
      { checkpoint: 3, title: "Order is being shipped", event: { checkpoint: 3, title: "Order is being shipped", description: "The package has left the vendor.", avatar: "truck" } },
      { checkpoint: 4, title: "Order just arrived Destination country", event: { checkpoint: 4, title: "Order just arrived Destination country", description: "The shipment reached its destination country.", avatar: "plane" } },
      { checkpoint: 5, title: "Order is out for delivery", event: { checkpoint: 5, title: "Order is out for delivery", description: "A demo rider is heading to the customer.", avatar: "motorcycle", riderName: "Demo Rider", riderPhone: "08000000000" } },
    ],
  }],
} as unknown as ApiTrackingResult;

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const linkToken = searchParams.get("token")?.trim() ?? "";
  const demo = searchParams.get("demo") === "1";
  const [orderNumber, setOrderNumber] = useState("");
  const [productId, setProductId] = useState("");
  const [result, setResult] = useState<ApiTrackingResult | null>(demo ? demoResult : null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(demo ? new Date() : null);
  const [linkLoading, setLinkLoading] = useState(Boolean(linkToken));

  const fetchTracking = useCallback(async () => {
    if (!orderNumber.trim()) return;
    const data = user ? await api.get<ApiTrackingResult>(`/api/tracking/order/${encodeURIComponent(orderNumber.trim())}`) : await api.post<ApiTrackingResult>("/api/tracking/public", { orderNumber: orderNumber.trim(), productId: productId.trim() });
    setResult(data); setLastUpdated(new Date()); setError(null);
  }, [orderNumber, productId, user]);

  const lookup = useCallback(async (event?: FormEvent) => {
    event?.preventDefault(); setLoading(true); setError(null);
    try { await fetchTracking(); } catch (err) { setResult(null); setError(err instanceof ApiError ? err.message : "We couldn't find that order."); } finally { setLoading(false); }
  }, [fetchTracking]);

  useEffect(() => {
    if (!linkToken || demo) { setLinkLoading(false); return; }
    let cancelled = false;
    void (async () => { try { const data = await api.get<ApiTrackingResult>(`/api/orders/track-link/${encodeURIComponent(linkToken)}`); if (cancelled) return; setResult(data); setOrderNumber(data.orderNumber); setLastUpdated(new Date()); setError(null); } catch (err) { if (!cancelled) setError(err instanceof ApiError ? err.message : "This tracking link is invalid or has expired."); } finally { if (!cancelled) setLinkLoading(false); } })();
    return () => { cancelled = true; };
  }, [linkToken, demo]);

  useEffect(() => {
    if (!result || linkToken || demo) return;
    const timer = window.setInterval(() => { void fetchTracking().catch(() => undefined); }, 30000);
    return () => window.clearInterval(timer);
  }, [result, linkToken, demo, fetchTracking]);

  useEffect(() => {
    if (!linkToken || !result || demo) return;
    const timer = window.setInterval(() => { void api.get<ApiTrackingResult>(`/api/orders/track-link/${encodeURIComponent(linkToken)}`).then((data) => { setResult(data); setLastUpdated(new Date()); }).catch(() => undefined); }, 30000);
    return () => window.clearInterval(timer);
  }, [linkToken, result, demo]);

  const itemCount = useMemo(() => result?.vendorOrders.reduce((sum, order) => sum + order.items.length, 0) ?? 0, [result]);

  if (linkToken && linkLoading && !result) return <div className="shell py-16 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL delivery</p><h1 className="mt-2 text-3xl font-bold text-graphite-900">Loading your order…</h1><p className="mt-2 text-sm text-graphite-600">Opening your secure tracking page.</p></div>;

  return <div className="shell py-8 sm:py-10"><div className="mx-auto max-w-5xl">
    <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL delivery</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-graphite-900">Track an order</h1><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Follow your product through a clear five-checkpoint delivery route.</p></div>
    {demo && <div className="mx-auto mt-5 max-w-3xl rounded-card border border-sky-200 bg-sky-50 p-4 text-center text-sm text-sky-800"><strong>Tracking demo mode.</strong> This page is using safe local demo data and does not call the tracking API. Remove <code>?demo=1</code> to use real orders.</div>}
    {!linkToken && !demo && <form onSubmit={lookup} className="mx-auto mt-7 max-w-2xl rounded-card border border-graphite-200 bg-white p-4 shadow-sm sm:p-5"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Order number</span><input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="TTFL-2026-123456" required className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600" /></label><label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Product ID</span><input value={productId} onChange={(event) => setProductId(event.target.value)} placeholder={user ? "Optional when signed in" : "Required without login"} required={!user} className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600" /></label></div><button disabled={loading || authLoading} className="mt-4 w-full rounded-card bg-ember-600 px-4 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">{loading ? "Finding order…" : "Track order"}</button>{!user && <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-graphite-500"><LogIn className="h-3.5 w-3.5"/>Already have an account? <Link href="/login?next=/orders/track" className="font-semibold text-ember-600">Log in to track without a Product ID.</Link></p>}</form>}
    {error && <div className="mx-auto mt-5 max-w-2xl rounded-card bg-ember-100 p-4 text-sm text-ember-700">{error}</div>}
    {result && <div className="mt-7"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs text-graphite-500">Order</p><p className="font-mono text-lg font-bold text-graphite-900">{result.orderNumber}</p><p className="mt-1 text-xs text-graphite-500">{itemCount} product item{itemCount === 1 ? "" : "s"} · Payment {result.paymentStatus.toLowerCase()}</p></div>{lastUpdated && <p className="text-xs text-graphite-400">Updated {lastUpdated.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</p>}</div><div className="flex flex-col gap-5">{result.vendorOrders.map((vendorOrder) => <VendorTracking key={vendorOrder.id} vendorOrder={vendorOrder} createdAt={result.createdAt} />)}</div></div>}
  </div></div>;
}

export default function TrackOrderPage() {
  return <Suspense fallback={<div className="shell py-16 text-center text-sm text-graphite-600">Loading tracking…</div>}><TrackOrderContent /></Suspense>;
}
