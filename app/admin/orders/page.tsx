"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

type AdminOrderRow = {
  id: string;
  orderNumber: string;
  totalAmount: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { items } = await api.get<{ items: AdminOrderRow[] }>("/api/orders/admin/list?limit=100");
    setOrders(items);
  }

  useEffect(() => {
    void load();
  }, []);

  async function refund(order: AdminOrderRow) {
    if (!confirm(`Refund ${formatNaira(Number(order.totalAmount))} for order ${order.orderNumber}? This calls Paystack directly and can't be undone.`)) return;
    setBusyId(order.id);
    setError(null);
    try {
      await api.post(`/api/orders/admin/${order.id}/refund`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Refund failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Orders</h1>

      {error && <p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      {orders === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-graphite-200 p-3">
              <div>
                <p className="font-mono text-sm font-semibold text-graphite-900">{order.orderNumber}</p>
                <p className="text-xs text-graphite-600">
                  {order.customer.firstName} {order.customer.lastName} · {order.customer.email}
                </p>
                <p className="text-xs text-graphite-400">
                  {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-graphite-900">{formatNaira(Number(order.totalAmount))}</span>
                <span
                  className={`rounded-tag px-2 py-1 text-xs font-medium ${
                    order.paymentStatus === "PAID"
                      ? "bg-verified-100 text-verified-700"
                      : order.paymentStatus === "REFUNDED"
                      ? "bg-cloud-100 text-graphite-500"
                      : "bg-ember-100 text-ember-700"
                  }`}
                >
                  {order.paymentStatus.toLowerCase()}
                </span>
                {order.paymentStatus === "PAID" && (
                  <button
                    onClick={() => refund(order)}
                    disabled={busyId === order.id}
                    className="rounded-card border border-ember-600 px-3 py-1.5 text-xs font-semibold text-ember-600 hover:bg-ember-100 disabled:opacity-60"
                  >
                    {busyId === order.id ? "Refunding…" : "Refund"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
