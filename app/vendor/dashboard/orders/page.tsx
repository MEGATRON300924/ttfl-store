"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiVendorOrder, OrderStatus } from "@/lib/api-types";
import { Bike, Car, Truck, PackageCheck, XCircle, ChevronDown } from "lucide-react";

const CHECKPOINTS = [
  { checkpoint: 1, title: "Order confirmed", hint: "Confirm that you have received the order." },
  { checkpoint: 2, title: "Order is being packaged", hint: "Tell the customer the item is being prepared." },
  { checkpoint: 3, title: "Order is being shipped", hint: "The package has left your location." },
  { checkpoint: 4, title: "Order just arrived Destination country", hint: "The shipment has reached the destination country." },
  { checkpoint: 5, title: "Order is out for delivery", hint: "The package is with the delivery rider." },
] as const;

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered", CANCELLED: "Cancelled", REFUND_REQUESTED: "Refund requested", REFUNDED: "Refunded", FAILED: "Failed",
};

const avatarOptions = [
  { value: "motorcycle", label: "Motorcycle", Icon: Bike },
  { value: "car", label: "Car", Icon: Car },
  { value: "truck", label: "Truck", Icon: Truck },
];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<ApiVendorOrder[] | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<{ orderId: string; checkpoint: number } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [avatar, setAvatar] = useState("motorcycle");

  async function load() {
    try {
      setError(null);
      const { vendorOrders } = await api.get<{ vendorOrders: ApiVendorOrder[] }>("/api/orders/vendor/me");
      setOrders(vendorOrders);
      const entries = await Promise.all(vendorOrders.map(async (vo) => {
        try {
          const response = await api.get<{ vendorOrder: { currentCheckpoint: number } }>(`/api/tracking/vendor/${vo.id}`);
          return [vo.id, response.vendorOrder.currentCheckpoint] as const;
        } catch {
          return [vo.id, vo.status === "PENDING" ? 0 : vo.status === "PROCESSING" ? 1 : vo.status === "SHIPPED" ? 3 : 5] as const;
        }
      }));
      setProgress(Object.fromEntries(entries));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load orders");
    }
  }

  useEffect(() => { void load(); }, []);

  function selectCheckpoint(orderId: string, checkpoint: number) {
    setSelected((current) => current?.orderId === orderId && current.checkpoint === checkpoint ? null : { orderId, checkpoint });
    setDescription("");
    setTrackingUrl("");
    setRiderName("");
    setRiderPhone("");
    setAvatar("motorcycle");
  }

  async function updateCheckpoint(orderId: string, checkpoint: number) {
    setBusyId(orderId);
    setError(null);
    try {
      await api.patch(`/api/tracking/vendor/${orderId}/checkpoint`, {
        checkpoint,
        description,
        trackingUrl,
        riderName,
        riderPhone,
        avatar,
      });
      setSelected(null);
      setDescription("");
      setTrackingUrl("");
      setRiderName("");
      setRiderPhone("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update tracking");
    } finally {
      setBusyId(null);
    }
  }

  async function cancelOrder(orderId: string) {
    if (!window.confirm("Cancel this vendor order? The customer will see the order as cancelled.")) return;
    setBusyId(orderId);
    setError(null);
    try {
      await api.patch(`/api/orders/vendor/${orderId}/status`, { status: "CANCELLED" });
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't cancel this order");
    } finally {
      setBusyId(null);
    }
  }

  async function markDelivered(orderId: string) {
    setBusyId(orderId);
    setError(null);
    try {
      await api.patch(`/api/orders/vendor/${orderId}/status`, { status: "DELIVERED" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't mark order delivered");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="shell py-8">
      <p className="text-xs font-bold uppercase tracking-wide text-ember-600">Fulfilment</p>
      <h1 className="text-xl font-bold text-graphite-900 dark:text-white">Orders & tracking</h1>
      <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Select any checkpoint to publish a clear delivery update. You can update checkpoints independently.</p>

      {error && <p role="alert" className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
      {orders === null ? <p className="mt-6 text-sm text-graphite-600">Loading…</p> : orders.length === 0 ? <div className="mt-6 rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">No orders yet.</div> : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((vo) => {
            const current = progress[vo.id] ?? 0;
            const isLocked = vo.status === "DELIVERED" || vo.status === "CANCELLED";
            const isOpen = selected?.orderId === vo.id;
            const selectedCheckpoint = isOpen ? selected.checkpoint : null;

            return (
              <div key={vo.id} className="rounded-card border border-graphite-200 bg-white p-4 dark:border-graphite-700 dark:bg-graphite-900 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-graphite-900 dark:text-white">{vo.order?.orderNumber}</p>
                    <p className="mt-1 text-xs text-graphite-500">{STATUS_LABEL[vo.status]} · Current checkpoint {current || "—"}/5</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-graphite-900 dark:text-white">{formatNaira(Number(vo.subtotal))}</span>
                </div>

                <ul className="mt-4 flex flex-col gap-2 border-t border-graphite-100 pt-3 text-sm text-graphite-700 dark:border-graphite-800 dark:text-graphite-300">
                  {vo.items.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2"><span>{item.productName} × {item.quantity}</span><span className="font-mono text-xs text-graphite-500">Product ID: {item.productId}</span></li>)}
                </ul>

                {!isLocked && (
                  <>
                    <div className="mt-5 grid gap-2 sm:grid-cols-5">
                      {CHECKPOINTS.map((cp) => {
                        const completed = cp.checkpoint <= current;
                        const active = selectedCheckpoint === cp.checkpoint;
                        return (
                          <button key={cp.checkpoint} type="button" onClick={() => selectCheckpoint(vo.id, cp.checkpoint)} className={`text-left rounded-card border p-3 transition ${active ? "border-ember-600 ring-2 ring-ember-100" : completed ? "border-ember-600 bg-ember-100" : "border-graphite-200 bg-white dark:border-graphite-700 dark:bg-graphite-900"}`}>
                            <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-ember-600">0{cp.checkpoint}</span>{completed && <span className="text-[10px] font-bold text-ember-600">UPDATED</span>}</div>
                            <p className="mt-1 text-xs font-semibold leading-5 text-graphite-900 dark:text-white">{cp.title}</p>
                          </button>
                        );
                      })}
                    </div>

                    {isOpen && selectedCheckpoint && (
                      <div className="mt-4 rounded-card border border-graphite-200 bg-cloud-100 p-4 dark:border-graphite-700 dark:bg-graphite-950">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-ember-600">Checkpoint {selectedCheckpoint}</p>
                            <p className="mt-1 text-sm font-semibold text-graphite-900 dark:text-white">{CHECKPOINTS[selectedCheckpoint - 1].title}</p>
                            <p className="mt-1 text-xs text-graphite-600 dark:text-graphite-400">{CHECKPOINTS[selectedCheckpoint - 1].hint}</p>
                          </div>
                          <button type="button" onClick={() => setSelected(null)} aria-label="Close checkpoint editor"><ChevronDown className="h-5 w-5 text-graphite-500" /></button>
                        </div>

                        {selectedCheckpoint === 5 && (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <span className="mb-1 block text-sm font-medium text-graphite-700 dark:text-graphite-300">Delivery vehicle</span>
                              <div className="grid grid-cols-3 gap-2">
                                {avatarOptions.map(({ value, label, Icon }) => <button type="button" key={value} onClick={() => setAvatar(value)} className={`flex items-center justify-center gap-1 rounded-card border px-2 py-2 text-xs font-semibold ${avatar === value ? "border-ember-600 bg-white text-ember-600 dark:bg-graphite-900" : "border-graphite-200 bg-white text-graphite-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-300"}`}><Icon className="h-4 w-4" />{label}</button>)}
                              </div>
                            </div>
                            <label className="text-sm"><span className="mb-1 block font-medium text-graphite-700 dark:text-graphite-300">Rider name</span><input value={riderName} onChange={(e) => setRiderName(e.target.value)} className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /></label>
                            <label className="text-sm"><span className="mb-1 block font-medium text-graphite-700 dark:text-graphite-300">Rider phone</span><input value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /></label>
                            <label className="text-sm sm:col-span-2"><span className="mb-1 block font-medium text-graphite-700 dark:text-graphite-300">Third-party tracking link</span><input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /></label>
                          </div>
                        )}

                        <label className="mt-3 block text-sm"><span className="mb-1 block font-medium text-graphite-700 dark:text-graphite-300">Customer update</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Example: Your order has been handed to the delivery partner." className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /></label>
                        <button disabled={busyId === vo.id} onClick={() => updateCheckpoint(vo.id, selectedCheckpoint)} className="mt-3 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-50">{busyId === vo.id ? "Saving…" : `Save checkpoint ${selectedCheckpoint}`}</button>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-graphite-100 pt-4 dark:border-graphite-800">
                      {current >= 5 && <button onClick={() => markDelivered(vo.id)} disabled={busyId === vo.id} className="rounded-card border border-verified-600 px-4 py-2.5 text-sm font-semibold text-verified-700 disabled:opacity-50">{busyId === vo.id ? "Saving…" : "Mark delivered"}</button>}
                      {(vo.status === "PENDING" || vo.status === "PROCESSING") && <button onClick={() => cancelOrder(vo.id)} disabled={busyId === vo.id} className="inline-flex items-center gap-2 rounded-card border border-ember-600 px-4 py-2.5 text-sm font-semibold text-ember-600 disabled:opacity-50"><XCircle className="h-4 w-4" />{busyId === vo.id ? "Cancelling…" : "Cancel order"}</button>}
                    </div>
                  </>
                )}

                <div className="mt-4 border-t border-graphite-100 pt-3 text-xs text-graphite-500 dark:border-graphite-800">Vendor earnings: <span className="font-mono font-medium text-graphite-900 dark:text-white">{formatNaira(Number(vo.vendorEarnings))}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
