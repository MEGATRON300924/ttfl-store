"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiVendorOrder, OrderStatus } from "@/lib/api-types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: "Start processing",
  PROCESSING: "Mark shipped",
  SHIPPED: "Mark out for delivery",
  OUT_FOR_DELIVERY: "Mark delivered",
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<ApiVendorOrder[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { vendorOrders } = await api.get<{ vendorOrders: ApiVendorOrder[] }>("/api/orders/vendor/me");
    setOrders(vendorOrders);
  }

  useEffect(() => {
    void load();
  }, []);

  async function advance(id: string, next: OrderStatus) {
    setBusyId(id);
    setError(null);
    try {
      await api.patch(`/api/orders/vendor/${id}/status`, { status: next });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update order");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Orders</h1>

      {error && <p className="mt-3 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      {orders === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((vo) => (
            <div key={vo.id} className="rounded-card border border-graphite-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-graphite-900">{vo.order?.orderNumber}</p>
                  <p className="text-xs text-graphite-400">{vo.status.replace(/_/g, " ").toLowerCase()}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-graphite-900">
                  {formatNaira(Number(vo.subtotal))}
                </span>
              </div>

              <ul className="mt-3 flex flex-col gap-1 text-sm text-graphite-700">
                {vo.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-mono">{formatNaira(Number(item.lineTotal))}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-graphite-200 pt-3 text-xs text-graphite-500">
                <span>
                  Your earnings: <span className="font-mono font-medium text-graphite-900">{formatNaira(Number(vo.vendorEarnings))}</span>{" "}
                  ({Number(vo.commissionRate)}% commission)
                </span>
              </div>

              {NEXT_STATUS[vo.status] && (
                <button
                  onClick={() => advance(vo.id, NEXT_STATUS[vo.status]!)}
                  disabled={busyId === vo.id}
                  className="mt-3 rounded-card bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
                >
                  {busyId === vo.id ? "Updating…" : NEXT_LABEL[vo.status]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
