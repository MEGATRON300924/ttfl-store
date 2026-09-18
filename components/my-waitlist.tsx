"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BellRing, CalendarDays, X } from "lucide-react";
import { api } from "@/lib/api-client";
import type { ApiWaitlistItem } from "@/lib/api-types";
import { formatNaira } from "@/lib/mock-data";

export function WaitlistLaunchAlert() {
  const [items, setItems] = useState<ApiWaitlistItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void api.get<{ items: ApiWaitlistItem[] }>("/api/products/alerts/waitlist/mine")
      .then((result) => {
        if (!active) return;
        const unseen = result.items.filter((item) => !item.seenAt);
        setItems(unseen);
        setOpen(unseen.length > 0);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function dismiss() {
    setOpen(false);
    await api.post("/api/products/alerts/waitlist/mine/ack").catch(() => undefined);
  }

  if (!open || !items.length) return null;
  return <div className="fixed inset-x-3 bottom-4 z-50 mx-auto max-w-lg rounded-[22px] border border-ember-200 bg-white p-4 shadow-2xl dark:border-ember-900 dark:bg-graphite-900">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-600 text-white"><BellRing className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-600">Your waitlist</p><h2 className="mt-1 text-lg font-bold text-graphite-900 dark:text-white">{items.length === 1 ? "Something you wanted just launched!" : "Some products on your waitlist just launched!"}</h2></div><button type="button" onClick={() => void dismiss()} aria-label="Close" className="rounded-full p-1 text-graphite-400 hover:bg-cloud-100"><X className="h-4 w-4" /></button></div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{items.slice(0,3).map((item) => <Link key={item.id} href={`/products/${item.slug}`} className="flex min-w-[220px] items-center gap-3 rounded-card border border-graphite-200 p-2.5 dark:border-graphite-700"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cloud-100">{item.image && <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-graphite-900 dark:text-white">{item.name}</p><p className="mt-1 font-mono text-xs text-ember-600">{formatNaira(Number(item.price))}</p></div></Link>)}</div>
        <button type="button" onClick={() => void dismiss()} className="mt-3 w-full rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-graphite-900">View later</button>
      </div>
    </div>
  </div>;
}

export function MyWaitlistSection() {
  const [items, setItems] = useState<ApiWaitlistItem[] | null>(null);
  useEffect(() => { void api.get<{ items: ApiWaitlistItem[] }>("/api/products/alerts/waitlist/mine").then((r) => setItems(r.items)).catch(() => setItems([])); }, []);
  return <section className="mt-8">
    <div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-sm font-bold uppercase tracking-wide text-graphite-600">My Waitlist</h2><p className="mt-1 text-xs text-graphite-500">Products you asked TTFL Store to notify you about.</p></div>{items && <span className="rounded-full bg-cloud-100 px-2.5 py-1 text-xs font-semibold text-graphite-600">{items.length}</span>}</div>
    {items === null ? <p className="text-sm text-graphite-500">Loading waitlist…</p> : items.length === 0 ? <div className="rounded-card border border-dashed border-graphite-200 p-8 text-center text-sm text-graphite-500">Your waitlist is empty. Join a Coming Soon product to see it here.</div> : <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <Link key={item.id} href={`/products/${item.slug}`} className="flex items-center gap-3 rounded-card border border-graphite-200 p-3 transition hover:border-ember-400 dark:border-graphite-700"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cloud-100">{item.image && <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-graphite-900 dark:text-white">{item.name}</p><p className="mt-1 font-mono text-sm font-semibold text-graphite-900 dark:text-white">{Number(item.price) > 0 ? formatNaira(Number(item.price)) : "Price coming soon"}</p><p className="mt-1 flex items-center gap-1 text-xs text-graphite-500">{item.launchAt ? <><CalendarDays className="h-3.5 w-3.5" />Launched {new Date(item.launchAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</> : "Coming Soon"}</p></div></Link>)}</div>}
  </section>;
}