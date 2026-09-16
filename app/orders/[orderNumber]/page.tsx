"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, Truck, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiOrder, OrderStatus } from "@/lib/api-types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-cloud-100 text-graphite-700",
  PROCESSING: "bg-gold-100 text-gold-600",
  SHIPPED: "bg-gold-100 text-gold-600",
  OUT_FOR_DELIVERY: "bg-gold-100 text-gold-600",
  DELIVERED: "bg-verified-100 text-verified-700",
  CANCELLED: "bg-ember-100 text-ember-700",
  REFUND_REQUESTED: "bg-ember-100 text-ember-700",
  REFUNDED: "bg-cloud-100 text-graphite-700",
  FAILED: "bg-ember-100 text-ember-700",
};

export default function OrderPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get<{ order: ApiOrder }>(`/api/orders/${encodeURIComponent(orderNumber)}`)
      .then((result) => { if (active) setOrder(result.order); })
      .catch((err) => { if (active) setError(err instanceof ApiError ? err.message : "We couldn't load this order."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderNumber]);

  if (loading) return <main className="shell py-16 text-center"><p className="text-sm text-graphite-600">Loading order…</p></main>;
  if (error || !order) return <main className="shell py-16 text-center"><h1 className="text-xl font-bold text-graphite-900">Order not found</h1><p className="mt-2 text-sm text-graphite-600">{error ?? "This order is unavailable or you don't have access to it."}</p><Link href="/account" className="mt-6 inline-flex rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white">Back to account</Link></main>;

  return <main className="shell py-8">
    <Link href="/account" className="inline-flex items-center gap-2 text-sm font-medium text-graphite-600 hover:text-ember-600"><ArrowLeft className="h-4 w-4" /> Back to account</Link>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Order</p><h1 className="mt-1 font-mono text-2xl font-bold text-graphite-900">{order.orderNumber}</h1><p className="mt-1 text-sm text-graphite-500">{new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p></div>
      <Link href={`/orders/track?order=${encodeURIComponent(order.orderNumber)}`} className="inline-flex items-center gap-2 rounded-card border border-graphite-300 px-4 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100"><Truck className="h-4 w-4" /> Track order</Link>
    </div>

    <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
      <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Package className="h-5 w-5" /></span><div><h2 className="font-bold text-graphite-900">Order status</h2><p className="mt-1 text-sm text-graphite-600">Payment: <span className="font-semibold">{order.paymentStatus}</span></p></div></div>
      <div className="mt-5 flex flex-col gap-3">{order.vendorOrders.map((vendorOrder) => <div key={vendorOrder.id} className="rounded-card border border-graphite-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-graphite-900">{vendorOrder.vendor?.storeName ?? "Vendor"}</p><span className={`rounded-tag px-2 py-1 text-xs font-semibold ${STATUS_STYLES[vendorOrder.status]}`}>{vendorOrder.status.replace(/_/g, " ")}</span></div><div className="mt-3 space-y-2">{vendorOrder.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm"><span className="text-graphite-700">{item.productName} × {item.quantity}</span><span className="font-mono font-semibold text-graphite-900">{formatNaira(Number(item.lineTotal))}</span></div>)}</div></div>)}</div>
    </section>

    <section className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-card border border-graphite-200 bg-white p-5"><h2 className="font-bold text-graphite-900">Delivery</h2><p className="mt-2 text-sm text-graphite-700">{order.deliveryName}</p><p className="text-sm text-graphite-600">{order.deliveryPhone}</p><p className="mt-2 text-sm leading-6 text-graphite-600">{order.deliveryLine1}{order.deliveryLine2 ? `, ${order.deliveryLine2}` : ""}<br />{order.deliveryCity}, {order.deliveryState}<br />{order.deliveryCountry}</p></div>
      <div className="rounded-card border border-graphite-200 bg-white p-5"><h2 className="font-bold text-graphite-900">Payment summary</h2><div className="mt-3 flex items-center justify-between text-sm"><span className="text-graphite-600">Total</span><span className="font-mono text-lg font-bold text-graphite-900">{formatNaira(Number(order.totalAmount))}</span></div>{order.paymentStatus === "PAID" && <p className="mt-3 flex items-center gap-2 text-sm font-medium text-verified-700"><CheckCircle2 className="h-4 w-4" /> Payment confirmed</p>}</div>
    </section>
  </main>;
}
