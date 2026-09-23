"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck, Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
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

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/orders");
      return;
    }

    api.get<{ orders: ApiOrder[] }>("/api/orders/me")
      .then((response) => setOrders(response.orders ?? []))
      .catch(() => setOrders([]));
  }, [user, loading, router]);

  if (loading || !user || orders === null) {
    return (
      <div className="shell flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex items-center gap-3 text-sm text-graphite-500">
          <Loader2 className="h-5 w-5 animate-spin text-ember-600" />
          Loading your orders...
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/account" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-ember-600">
            <ArrowLeft className="h-4 w-4" />
            Back to account
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL Store</p>
          <h1 className="mt-1 text-2xl font-bold text-graphite-900">My orders</h1>
          <p className="mt-1 text-sm text-graphite-500">
            View your purchases, payment status, and delivery progress.
          </p>
        </div>
        <Link
          href="/orders/track"
          className="inline-flex items-center gap-2 rounded-card border border-graphite-300 px-4 py-2.5 text-sm font-semibold text-graphite-800 hover:bg-cloud-100"
        >
          <Truck className="h-4 w-4" />
          Track an order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-graphite-200 p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-graphite-300" />
          <h2 className="mt-4 text-lg font-bold text-graphite-900">No orders yet</h2>
          <p className="mt-1 text-sm text-graphite-500">Your purchases will appear here after you place an order.</p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-card border border-graphite-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-bold text-graphite-900">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-graphite-400">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                  </p>
                </div>
                <p className="font-mono text-base font-bold text-graphite-900">
                  {formatNaira(Number(order.totalAmount))}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.vendorOrders.map((vendorOrder) => (
                  <span
                    key={vendorOrder.id}
                    className={`rounded-tag px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[vendorOrder.status] ?? STATUS_STYLES.PENDING}`}
                  >
                    {vendorOrder.items.length} item{vendorOrder.items.length === 1 ? "" : "s"} · {vendorOrder.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                ))}
                {order.paymentStatus !== "PAID" && (
                  <span className="rounded-tag bg-ember-100 px-2.5 py-1 text-xs font-semibold text-ember-700">
                    Payment {order.paymentStatus.toLowerCase()}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-graphite-100 pt-4">
                <div className="flex items-center gap-2 text-sm text-graphite-500">
                  <Package className="h-4 w-4" />
                  {order.vendorOrders.reduce((total, vendorOrder) => total + vendorOrder.items.length, 0)} item(s)
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="rounded-card border border-graphite-300 px-3 py-2 text-xs font-semibold text-graphite-800 hover:bg-cloud-100"
                  >
                    View order
                  </Link>
                  <Link
                    href={`/orders/track?order=${encodeURIComponent(order.orderNumber)}`}
                    className="rounded-card bg-graphite-900 px-3 py-2 text-xs font-semibold text-white hover:bg-graphite-800"
                  >
                    Track
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
