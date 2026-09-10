"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function ComingSoonWaitlist({ productId, productName }: { productId: string; productName: string }) {
  const { user } = useAuth();
  const [count, setCount] = useState<number | null>(null);
  const [email, setEmail] = useState(user?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(user?.email ?? "");
    setWhatsapp(user?.phone ?? "");
  }, [user]);

  useEffect(() => {
    let active = true;
    void api.get<{ count: number; open: boolean }>(`/api/products/alerts/${productId}/waitlist`)
      .then((result) => { if (active) setCount(result.count); })
      .catch(() => { if (active) setCount(null); });
    return () => { active = false; };
  }, [productId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await api.post<{ count: number; alreadySubscribed?: boolean }>(`/api/products/alerts/${productId}/waitlist`, {
        email: email || undefined,
        whatsapp: whatsapp || undefined,
      });
      setCount(result.count);
      setJoined(true);
      setOpen(false);
      setMessage(result.alreadySubscribed ? "You're already on the waitlist." : "You're on the waitlist. We'll let you know when it launches.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join the waitlist.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-ember-200 bg-gradient-to-br from-ember-50 via-white to-cloud-50 p-5 shadow-sm dark:border-ember-900 dark:from-graphite-900 dark:via-graphite-900 dark:to-graphite-950">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ember-600 text-white shadow-sm"><BellRing className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-700 dark:text-ember-400">Coming Soon waitlist</p>
          <h2 className="mt-1 text-lg font-bold text-graphite-900 dark:text-white">Be first when {productName} arrives</h2>
          <p className="mt-1 text-sm leading-5 text-graphite-600 dark:text-graphite-400">Join the public launch list and we’ll notify you when this product becomes available.</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-card border border-graphite-200 bg-white/80 px-3 py-3 dark:border-graphite-700 dark:bg-graphite-950/60">
        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-ember-600" /><span className="text-sm font-semibold text-graphite-900 dark:text-white">{count === null ? "—" : count.toLocaleString()} {count === 1 ? "person" : "people"} waiting</span></div>
        {joined && <span className="flex items-center gap-1 text-xs font-bold text-verified-700"><CheckCircle2 className="h-4 w-4" /> Joined</span>}
      </div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-card bg-graphite-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-graphite-800"><BellRing className="h-4 w-4" />{joined ? "You're on the waitlist" : "Join the waitlist"}</button>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" />
          <input type="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="WhatsApp number" className="w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" />
          <p className="text-xs text-graphite-500">Add at least one contact method so TTFL Store can notify you.</p>
          {error && <p className="rounded-card bg-ember-100 px-3 py-2 text-xs text-ember-700">{error}</p>}
          <div className="flex gap-2"><button type="button" onClick={() => { setOpen(false); setError(null); }} className="flex-1 rounded-card border border-graphite-200 px-3 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving} className="flex-1 rounded-card bg-ember-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Joining…" : "Join waitlist"}</button></div>
        </form>
      )}
      {message && <p className="mt-3 rounded-card bg-verified-100 px-3 py-2 text-xs font-medium text-verified-700">{message}</p>}
    </section>
  );
}
