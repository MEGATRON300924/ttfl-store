"use client";

import { useState } from "react";
import { Bell, Mail, MessageCircle, Tag } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function ProductAlerts({ productId, productName, currentPrice, outOfStock }: { productId: string; productName: string; currentPrice: number; outOfStock: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"BACK_IN_STOCK" | "PRICE_DROP">(outOfStock ? "BACK_IN_STOCK" : "PRICE_DROP");
  const [email, setEmail] = useState(user?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? "");
  const [targetPrice, setTargetPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(null); setMessage(null);
    try {
      const result = await api.post<{ message?: string }>(`/api/products/alerts/${productId}`, { type, email: email.trim() || undefined, whatsapp: whatsapp.trim() || undefined, targetPrice: type === "PRICE_DROP" ? Number(targetPrice) : undefined });
      setMessage(result.message ?? "Alert created. We'll let you know when it happens."); setOpen(false);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not create this alert."); }
    finally { setSaving(false); }
  }

  return <div className="mt-4 rounded-card border border-graphite-200 bg-cloud-50 p-4 dark:border-graphite-700 dark:bg-graphite-900">
    <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-100 text-ember-700">{outOfStock ? <Bell className="h-5 w-5" /> : <Tag className="h-5 w-5" />}</span><div><p className="text-sm font-bold text-graphite-900 dark:text-white">Get a product alert</p><p className="mt-1 text-xs leading-5 text-graphite-600 dark:text-graphite-400">{outOfStock ? `${productName} is currently out of stock.` : `Set a target price for ${productName}. Current price: ₦${currentPrice.toLocaleString()}.`}</p></div></div>
    {!open ? <button type="button" onClick={() => { setOpen(true); setError(null); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-card border border-graphite-900 bg-graphite-900 px-4 py-3 text-sm font-semibold text-white hover:bg-graphite-800"><Bell className="h-4 w-4" /> Create alert</button> : <form onSubmit={submit} className="mt-4 space-y-3">
      {outOfStock && <div className="flex gap-2"><button type="button" onClick={() => setType("BACK_IN_STOCK")} className={`flex-1 rounded-card border px-3 py-2 text-xs font-semibold ${type === "BACK_IN_STOCK" ? "border-ember-600 bg-ember-100 text-ember-700" : "border-graphite-200"}`}>Back in stock</button><button type="button" onClick={() => setType("PRICE_DROP")} className={`flex-1 rounded-card border px-3 py-2 text-xs font-semibold ${type === "PRICE_DROP" ? "border-ember-600 bg-ember-100 text-ember-700" : "border-graphite-200"}`}>Price drop</button></div>}
      {type === "PRICE_DROP" && <input required type="number" min="1" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="Target price (₦)" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" />}
      <label className="flex items-center gap-2 text-xs font-medium text-graphite-700 dark:text-graphite-300"><Mail className="h-4 w-4" /> Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" />
      <label className="flex items-center gap-2 text-xs font-medium text-graphite-700 dark:text-graphite-300"><MessageCircle className="h-4 w-4" /> WhatsApp</label><input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp number" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" />
      {error && <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-xs text-ember-700">{error}</p>}
      <div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-card border border-graphite-200 px-3 py-2.5 text-sm font-semibold">Cancel</button><button type="submit" disabled={saving} className="flex-1 rounded-card bg-ember-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save alert"}</button></div>
    </form>}
    {message && <p className="mt-3 rounded-[7px] bg-verified-100 px-3 py-2 text-xs font-medium text-verified-700">{message}</p>}
  </div>;
}
