"use client";

import type { FormEvent } from "react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock3, LogIn, MapPin, Package, Phone, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";
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
  return estimatedDate(createdAt, vendorOrder.items[0]?.estimatedDeliveryDays ?? 7);
}

function TrackingMap({ vendorOrder, createdAt }: { vendorOrder: ApiTrackedVendorOrder; createdAt: string }) {
  const current = Math.min(5, Math.max(1, vendorOrder.currentCheckpoint));
  const estimate = getEstimatedDeliveryDate(vendorOrder, createdAt);
  const currentEvent = vendorOrder.checkpoints[current - 1]?.event;
  const progress = (current - 1) / 4;
  const route = "M74 286 C150 254 150 176 248 178 S365 302 452 235 S570 122 730 74";

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-graphite-200 bg-[#eef2f4]">
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <svg viewBox="0 0 800 360" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <pattern id="ttfl-map-grid" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(10)">
              <path d="M0 32H64M32 0V64" stroke="#d8dee2" strokeWidth="2" />
              <path d="M0 8H64M8 0V64" stroke="#e6eaec" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="360" fill="#eef2f4" />
          <rect width="800" height="360" fill="url(#ttfl-map-grid)" />
          <path d="M0 86 C120 40 180 116 286 72 S510 44 800 106" fill="none" stroke="#d3dadd" strokeWidth="22" opacity=".8" />
          <path d="M-20 324 C130 286 222 328 330 284 S610 250 820 310" fill="none" stroke="#d3dadd" strokeWidth="18" opacity=".75" />
          <path d="M96 -20 C140 86 128 176 184 390M630 -20 C586 90 646 210 590 390M360 -20 C410 78 330 184 390 390" fill="none" stroke="#dfe4e7" strokeWidth="12" opacity=".7" />
          <path d={route} fill="none" stroke="white" strokeWidth="18" strokeLinecap="round" opacity=".95" />
          <path d={route} fill="none" stroke="#f97316" strokeWidth="7" strokeLinecap="round" strokeDasharray="1 18" />
          <path d={route} fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 18" strokeDashoffset={Math.round(progress * 52)} />
        </svg>
      </div>

      <div className="relative h-[390px] sm:h-[430px]">
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-graphite-800 shadow-lg backdrop-blur">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,.12)]" />
          Live delivery route
        </div>

        <div className="absolute right-4 top-4 z-10 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-right shadow-lg backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-wider text-graphite-500">Estimated arrival</p>
          <p className="mt-0.5 text-sm font-bold text-graphite-950">{estimate.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}</p>
        </div>

        <div className="absolute left-[8%] top-[74%] z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-graphite-950 text-white shadow-xl">
          <Package className="h-5 w-5" />
        </div>
        <div className="absolute right-[7%] top-[13%] z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-white text-ember-600 shadow-xl">
          <MapPin className="h-5 w-5" />
        </div>

        {currentEvent && (
          <div className="absolute z-20" style={{ left: `${8 + progress * 84}%`, top: `${74 - progress * 61}%`, transform: "translate(-50%, -50%)" }}>
            <div className="relative flex h-20 w-24 items-center justify-center rounded-[22px] border border-white bg-white shadow-[0_14px_30px_rgba(15,23,42,.2)]">
              <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white bg-white" />
              <TrackingVehicleAvatar type={currentEvent.avatar} size="md" />
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember-100 text-ember-600"><Truck className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-graphite-500">Status</p>
              <p className="text-sm font-bold text-graphite-950">{currentEvent?.title || checkpoints[current - 1]}</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-graphite-500">{current}/5 checkpoints</p>
        </div>
      </div>
    </div>
  );
}

function VendorTracking({ vendorOrder, createdAt }: { vendorOrder: ApiTrackedVendorOrder; createdAt: string }) {
  const current = Math.min(5, Math.max(1, vendorOrder.currentCheckpoint));
  const estimate = getEstimatedDeliveryDate(vendorOrder, createdAt);
  const lastEvent = vendorOrder.checkpoints.find((item) => item.checkpoint === current)?.event;
  const rider = lastEvent?.riderName;
  const riderPhone = lastEvent?.riderPhone;

  return (
    <section className="overflow-hidden rounded-[30px] border border-graphite-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,.06)]">
      <div className="border-b border-graphite-100 px-4 pb-4 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ember-600">{vendorOrder.vendor.storeName}</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-graphite-950">Your delivery</h2>
            <p className="mt-1 text-xs text-graphite-500">Updated automatically while your order is moving.</p>
          </div>
          <div className="hidden rounded-2xl bg-graphite-50 px-3 py-2 text-right sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-graphite-500">Arrives</p>
            <p className="text-sm font-bold text-graphite-900">{estimate.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}</p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <TrackingMap vendorOrder={vendorOrder} createdAt={createdAt} />

        {lastEvent && (
          <div className="mt-4 flex flex-col gap-4 rounded-[24px] border border-graphite-100 bg-graphite-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Check className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-graphite-950">Latest update</p>
                <p className="mt-0.5 text-sm text-graphite-700">{lastEvent.description || lastEvent.title}</p>
              </div>
            </div>
            {rider && (
              <div className="flex items-center gap-3 border-t border-graphite-200 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <TrackingVehicleAvatar type={lastEvent.avatar} size="sm" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-graphite-500">Rider</p>
                  <p className="text-sm font-bold text-graphite-900">{rider}</p>
                  {riderPhone && <a href={`tel:${riderPhone}`} className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-ember-600"><Phone className="h-3 w-3" />{riderPhone}</a>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 rounded-[24px] border border-graphite-100 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-xs font-bold text-graphite-950">Delivery progress</p><p className="mt-0.5 text-[11px] text-graphite-500">Five simple checkpoints from store to door.</p></div>
            <span className="rounded-full bg-ember-100 px-2.5 py-1 text-[10px] font-bold text-ember-700">{current}/5</span>
          </div>
          <div className="relative">
            <div className="absolute left-[15px] top-4 h-[calc(100%-32px)] w-0.5 bg-graphite-100" />
            <div className="absolute left-[15px] top-4 w-0.5 bg-ember-500" style={{ height: `${Math.max(0, (current - 1) / 4) * 100}%` }} />
            <div className="space-y-4">
              {checkpoints.map((title, index) => {
                const number = index + 1;
                const event = vendorOrder.checkpoints[index]?.event;
                const done = number <= current;
                const active = number === current;
                return (
                  <div key={title} className="relative flex gap-3">
                    <div className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white ${done ? "bg-ember-500 text-white shadow-sm" : "bg-graphite-100 text-graphite-400"}`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{number}</span>}
                    </div>
                    <div className={`min-w-0 flex-1 rounded-2xl px-3 py-2.5 ${active ? "bg-ember-50 ring-1 ring-ember-100" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-bold ${done ? "text-graphite-950" : "text-graphite-500"}`}>{title}</p>
                          {event?.description && <p className="mt-0.5 text-xs leading-5 text-graphite-600">{event.description}</p>}
                        </div>
                        {active && <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-ember-600" />}
                      </div>
                      {event?.trackingUrl && <a href={event.trackingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-bold text-ember-600">Open tracking link →</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-graphite-950 px-4 py-3 text-white">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /><span className="text-xs font-semibold">Your tracking link is secure</span></div>
          {riderPhone && <a href={`tel:${riderPhone}`} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/15">Call rider</a>}
        </div>
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
    if (!user) {
      setError("Please log in to track an order by order number, or open the secure tracking link sent with your order.");
      return;
    }
    const data = await api.get<ApiTrackingResult>(`/api/tracking/order/${encodeURIComponent(orderNumber.trim())}`);
    setResult(data);
    setLastUpdated(new Date());
    setError(null);
  }, [orderNumber, user]);

  const lookup = useCallback(async (event?: FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    try { await fetchTracking(); }
    catch (err) { setResult(null); setError(err instanceof ApiError ? err.message : "We couldn't find that order."); }
    finally { setLoading(false); }
  }, [fetchTracking]);

  useEffect(() => {
    if (!linkToken || demo) { setLinkLoading(false); return; }
    let cancelled = false;
    void (async () => {
      try {
        const data = await api.get<ApiTrackingResult>(`/api/orders/track-link/${encodeURIComponent(linkToken)}`);
        if (cancelled) return;
        setResult(data); setOrderNumber(data.orderNumber); setLastUpdated(new Date()); setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "This tracking link is invalid or has expired.");
      } finally { if (!cancelled) setLinkLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [linkToken, demo]);

  useEffect(() => {
    if (!result || linkToken || demo) return;
    const timer = window.setInterval(() => { void fetchTracking().catch(() => undefined); }, 30000);
    return () => window.clearInterval(timer);
  }, [result, linkToken, demo, fetchTracking]);

  useEffect(() => {
    if (!linkToken || !result || demo) return;
    const timer = window.setInterval(() => {
      void api.get<ApiTrackingResult>(`/api/orders/track-link/${encodeURIComponent(linkToken)}`)
        .then((data) => { setResult(data); setLastUpdated(new Date()); })
        .catch(() => undefined);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [linkToken, result, demo]);

  const itemCount = useMemo(() => result?.vendorOrders.reduce((sum, order) => sum + order.items.length, 0) ?? 0, [result]);

  if (linkToken && linkLoading && !result) {
    return <div className="shell py-16 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL delivery</p><h1 className="mt-2 text-3xl font-bold text-graphite-900">Loading your order…</h1><p className="mt-2 text-sm text-graphite-600">Opening your secure tracking page.</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      <div className="shell py-5 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Link href="/orders" className="inline-flex items-center gap-2 rounded-full border border-graphite-200 bg-white px-3 py-2 text-xs font-bold text-graphite-700 shadow-sm hover:border-graphite-300">
              <ArrowLeft className="h-3.5 w-3.5" /> Orders
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold text-graphite-500"><RefreshCw className="h-3.5 w-3.5" /> Auto-updates every 30s</div>
          </div>

          <div className="mb-6 rounded-[30px] bg-graphite-950 px-5 py-6 text-white shadow-xl sm:px-7">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-300">TTFL delivery</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Track your order</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">A clean, live delivery view from the store to your door.</p>
              </div>
              {result && <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Order</p><p className="mt-1 font-mono text-sm font-bold">{result.orderNumber}</p></div>}
            </div>
          </div>

          {demo && <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800"><strong>Tracking demo mode.</strong> This page is using safe local demo data and does not call the tracking API. Remove <code>?demo=1</code> to use real orders.</div>}

          {!linkToken && !demo && (
            user ? (
              <form onSubmit={lookup} className="mb-6 rounded-[26px] border border-graphite-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label className="text-sm"><span className="mb-1 block text-xs font-bold text-graphite-700">Order number</span><input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="TTFL-2026-123456" required className="w-full rounded-2xl border border-graphite-200 bg-graphite-50 px-3.5 py-3 outline-none transition focus:border-ember-500 focus:bg-white" /></label>
                  <button disabled={loading || authLoading} className="mt-auto rounded-2xl bg-ember-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-ember-700 disabled:opacity-60">{loading ? "Finding…" : "Track order"}</button>
                </div>
              </form>
            ) : (
              <div className="mb-6 rounded-[26px] border border-graphite-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ember-100 text-ember-700"><LogIn className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-graphite-900">Track securely</p>
                    <p className="mt-1 text-xs leading-5 text-graphite-600">Sign in to track an order by order number, or use the secure tracking link included with your order updates.</p>
                    <Link href="/login?next=/orders/track" className="mt-3 inline-flex rounded-2xl bg-ember-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-ember-700">Log in to track</Link>
                  </div>
                </div>
              </div>
            )
          )}

          {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          {result && (
            <div>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div><p className="text-xs font-bold uppercase tracking-wider text-graphite-400">Shipment</p><p className="mt-1 text-sm font-bold text-graphite-900">{itemCount} product item{itemCount === 1 ? "" : "s"} · Payment {result.paymentStatus.toLowerCase()}</p></div>
                {lastUpdated && <p className="text-xs text-graphite-400">Last updated {lastUpdated.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</p>}
              </div>
              <div className="flex flex-col gap-5">{result.vendorOrders.map((vendorOrder) => <VendorTracking key={vendorOrder.id} vendorOrder={vendorOrder} createdAt={result.createdAt} />)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return <Suspense fallback={<div className="shell py-16 text-center text-sm text-graphite-600">Loading tracking…</div>}><TrackOrderContent /></Suspense>;
}
