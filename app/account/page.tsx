"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
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

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);

  useEffect(() => {
    if (user) {
      api.get<{ orders: ApiOrder[] }>("/api/orders/me").then((r) => setOrders(r.orders));
    }
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">Log in to view your account</h1>
        <Link
          href="/login?next=/account"
          className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">
        {user ? `Hi, ${user.firstName}` : "My account"}
      </h1>

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-graphite-600">Order history</h2>

      {orders === null ? (
        <p className="text-sm text-graphite-600">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">
          <Package className="mx-auto mb-2 h-8 w-8 text-graphite-300" />
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-card border border-graphite-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-graphite-900">{order.orderNumber}</p>
                  <p className="text-xs text-graphite-400">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-graphite-900">
                  {formatNaira(Number(order.totalAmount))}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {order.vendorOrders.map((vo) => (
                  <span
                    key={vo.id}
                    className={`rounded-tag px-2 py-1 text-xs font-medium ${STATUS_STYLES[vo.status]}`}
                  >
                    {vo.items.length} item(s) · {vo.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                ))}
                {order.paymentStatus !== "PAID" && (
                  <span className="rounded-tag bg-ember-100 px-2 py-1 text-xs font-medium text-ember-700">
                    Payment {order.paymentStatus.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
