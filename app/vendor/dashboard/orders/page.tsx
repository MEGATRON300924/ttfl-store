"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiVendorOrder, OrderStatus } from "@/lib/api-types";
import { Bike, Car, Truck, PackageCheck } from "lucide-react";

const CHECKPOINTS = [
  { checkpoint: 1, title: "Order confirmed" },
  { checkpoint: 2, title: "Order is being packaged" },
  { checkpoint: 3, title: "Order is being shipped" },
  { checkpoint: 4, title: "Order just arrived Destination country" },
  { checkpoint: 5, title: "Order is out for delivery" },
];
const STATUS_LABEL: Record<OrderStatus, string> = { PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled", REFUND_REQUESTED: "Refund requested", REFUNDED: "Refunded", FAILED: "Failed" };
const avatarOptions = [{ value: "motorcycle", label: "Motorcycle", Icon: Bike }, { value: "car", label: "Car", Icon: Car }, { value: "truck", label: "Truck", Icon: Truck }];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<ApiVendorOrder[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [avatar, setAvatar] = useState("motorcycle");

  async function load() {
    const { vendorOrders } = await api.get<{ vendorOrders: ApiVendorOrder[] }>("/api/orders/vendor/me");
    setOrders(vendorOrders);
  }
  useEffect(() => { void load(); }, []);

  async function updateCheckpoint(id: string, checkpoint: number) {
    setBusyId(id); setError(null);
    try {
      await api.patch(`/api/tracking/vendor/${id}/checkpoint`, { checkpoint, description, trackingUrl, riderName, riderPhone, avatar });
      setOpenId(null); setDescription(""); setTrackingUrl(""); setRiderName(""); setRiderPhone("");
      await load();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't update tracking"); }
    finally { setBusyId(null); }
  }

  return <div className="shell py-8">
    <p className="text-xs font-bold uppercase tracking-wide text-ember-600">Fulfilment</p>
    <h1 className="text-xl font-bold text-graphite-900">Orders & tracking</h1>
    <p className="mt-1 text-sm text-graphite-600">Give customers clear progress updates for every order.</p>
    {error && <p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
    {orders === null ? <p className="mt-6 text-sm text-graphite-600">Loading…</p> : orders.length === 0 ? <div className="mt-6 rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">No orders yet.</div> : <div className="mt-6 flex flex-col gap-4">{orders.map((vo) => {
      const nextCheckpoint = Math.min(5, (vo.status === "PENDING" ? 1 : vo.status === "PROCESSING" ? 2 : vo.status === "SHIPPED" ? 4 : 5));
      return <div key={vo.id} className="rounded-card border border-graphite-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-sm font-semibold text-graphite-900">{vo.order?.orderNumber}</p><p className="mt-1 text-xs text-graphite-500">{STATUS_LABEL[vo.status]}</p></div><span className="font-mono text-sm font-semibold text-graphite-900">{formatNaira(Number(vo.subtotal))}</span></div>
        <ul className="mt-4 flex flex-col gap-2 border-t border-graphite-100 pt-3 text-sm text-graphite-700">{vo.items.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2"><span>{item.productName} × {item.quantity}</span><span className="font-mono text-xs text-graphite-500">Product ID: {item.productId}</span></li>)}</ul>
        {vo.status !== "DELIVERED" && vo.status !== "CANCELLED" && <><button onClick={() => setOpenId(openId === vo.id ? null : vo.id)} className="mt-4 inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800"><PackageCheck className="h-4 w-4" />Update tracking</button>
        {openId === vo.id && <div className="mt-4 rounded-card bg-cloud-100 p-4"><div className="grid gap-2 sm:grid-cols-5">{CHECKPOINTS.map((cp) => <div key={cp.checkpoint} className={`rounded-card border p-3 text-xs ${cp.checkpoint <= nextCheckpoint ? "border-ember-600 bg-white" : "border-graphite-200 bg-white"}`}><span className="font-mono font-bold text-ember-600">0{cp.checkpoint}</span><p className="mt-1 font-semibold text-graphite-900">{cp.title}</p></div>)}</div>
          {nextCheckpoint === 5 && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><span className="mb-1 block text-sm font-medium text-graphite-700">Delivery vehicle</span><div className="grid grid-cols-3 gap-2">{avatarOptions.map(({ value, label, Icon }) => <button type="button" key={value} onClick={() => setAvatar(value)} className={`flex items-center justify-center gap-1 rounded-card border px-2 py-2 text-xs font-semibold ${avatar === value ? "border-ember-600 bg-white text-ember-600" : "border-graphite-200 bg-white text-graphite-600"}`}><Icon className="h-4 w-4" />{label}</button>)}</div></div><label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Rider name</span><input value={riderName} onChange={(e) => setRiderName(e.target.value)} className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 outline-none focus:border-ember-600" /></label><label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Rider phone</span><input value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 outline-none focus:border-ember-600" /></label><label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Third-party tracking link</span><input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 outline-none focus:border-ember-600" /></label></div>}
          <label className="mt-3 block text-sm"><span className="mb-1 block font-medium text-graphite-700">Customer update</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Optional message for the customer…" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 outline-none focus:border-ember-600" /></label>
          <button disabled={busyId === vo.id} onClick={() => updateCheckpoint(vo.id, nextCheckpoint)} className="mt-3 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busyId === vo.id ? "Saving…" : `Mark checkpoint ${nextCheckpoint}`}</button>
        </div>}</>}
        <div className="mt-4 border-t border-graphite-100 pt-3 text-xs text-graphite-500">Vendor earnings: <span className="font-mono font-medium text-graphite-900">{formatNaira(Number(vo.vendorEarnings))}</span></div>
      </div>;
    })}</div>}
  </div>;
}
