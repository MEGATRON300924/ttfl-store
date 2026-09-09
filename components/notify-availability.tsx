"use client";

import { useState } from "react";
import { Bell, Mail, MessageCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function NotifyAvailability({ productId, productName }: { productId: string; productName: string }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? "");
  const [notifyEmail, setNotifyEmail] = useState(Boolean(user?.email));
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(Boolean(user?.phone));
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(null); setError(null);
    try {
      const result = await api.post<{ message: string }>(`/api/products/${productId}/availability-notifications`, { email, whatsapp, notifyEmail, notifyWhatsApp });
      setMessage(result.message); setOpen(false);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not save your notification request."); }
    finally { setSaving(false); }
  }

  return <div className="rounded-card border border-graphite-200 bg-cloud-50 p-4 dark:border-graphite-700 dark:bg-graphite-900">
    <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-100 text-ember-700"><Bell className="h-5 w-5" /></span><div className="min-w-0"><p className="text-sm font-bold text-graphite-900 dark:text-white">Coming soon</p><p className="mt-1 text-xs leading-5 text-graphite-600 dark:text-graphite-400">{productName} isn't available yet. Get notified as soon as it launches.</p></div></div>
    {!open ? <button type="button" onClick={() => { setOpen(true); setError(null); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-card bg-graphite-900 px-4 py-3 text-sm font-semibold text-white hover:bg-graphite-800"><Bell className="h-4 w-4" /> Notify me</button> : <form onSubmit={submit} className="mt-4 space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-graphite-800 dark:text-graphite-200"><input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} /><Mail className="h-4 w-4" /> Email</label>
      {notifyEmail && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" />}
      <label className="flex items-center gap-2 text-sm font-medium text-graphite-800 dark:text-graphite-200"><input type="checkbox" checked={notifyWhatsApp} onChange={(e) => setNotifyWhatsApp(e.target.checked)} /><MessageCircle className="h-4 w-4" /> WhatsApp</label>
      {notifyWhatsApp && <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp number" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" />}
      {error && <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-xs text-ember-700">{error}</p>}
      <div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-card border border-graphite-200 px-3 py-2.5 text-sm font-semibold dark:border-graphite-700">Cancel</button><button type="submit" disabled={saving} className="flex-1 rounded-card bg-ember-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Notify me"}</button></div>
    </form>}
    {message && <p className="mt-3 rounded-[7px] bg-verified-100 px-3 py-2 text-xs font-medium text-verified-700">{message}</p>}
  </div>;
}
