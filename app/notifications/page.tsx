"use client";

import Link from "next/link";
import { Bell, CheckCheck, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  url: string | null;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading || !user) return;
    void api.get<{ notifications: Notification[] }>("/api/notifications?limit=100")
      .then((result) => setItems(result.notifications))
      .finally(() => setBusy(false));
  }, [loading, user]);

  async function markRead(id: string) {
    await api.patch("/api/notifications/" + id + "/read");
    setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
  }

  async function markAllRead() {
    await api.post("/api/notifications/read-all");
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
  }

  if (loading || busy) return <main className="shell py-16 text-center text-sm text-graphite-600 dark:text-graphite-400">Loading notifications…</main>;
  if (!user) return <main className="shell py-16 text-center"><h1 className="text-xl font-bold text-graphite-900 dark:text-white">Sign in to view notifications</h1><Link href="/login" className="mt-4 inline-flex rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white">Sign in</Link></main>;

  const unread = items.filter((item) => !item.readAt).length;

  return (
    <main className="min-h-[70vh] bg-[#f6f7f7] dark:bg-[#0b0d10]">
      <div className="shell py-8 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-600">Your updates</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-graphite-900 dark:text-white">Notifications</h1>
            <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">{unread ? unread + " unread notification" + (unread === 1 ? "" : "s") : "You're all caught up."}</p>
          </div>
          {unread > 0 && <button type="button" onClick={() => void markAllRead()} className="inline-flex items-center gap-2 rounded-card border border-graphite-200 bg-white px-3 py-2 text-xs font-semibold text-graphite-700 hover:bg-cloud-100 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-200"><CheckCheck className="h-4 w-4" />Mark all read</button>}
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-graphite-200 bg-white shadow-sm dark:border-graphite-800 dark:bg-graphite-900">
          {items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cloud-100 text-graphite-500 dark:bg-graphite-800 dark:text-graphite-300"><Bell className="h-5 w-5" /></span>
              <h2 className="mt-4 font-semibold text-graphite-900 dark:text-white">No notifications yet</h2>
              <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Order and account updates will appear here.</p>
            </div>
          ) : items.map((item) => {
            const content = (
              <div className={"flex gap-4 px-5 py-4 transition hover:bg-cloud-50 dark:hover:bg-graphite-800/60 " + (!item.readAt ? "bg-ember-50/50 dark:bg-ember-950/10" : "")}>
                <span className={"mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl " + (!item.readAt ? "bg-ember-100 text-ember-600 dark:bg-ember-900/40 dark:text-ember-300" : "bg-cloud-100 text-graphite-500 dark:bg-graphite-800 dark:text-graphite-300")}>
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={"text-sm " + (!item.readAt ? "font-bold text-graphite-900 dark:text-white" : "font-semibold text-graphite-800 dark:text-graphite-200")}>{item.title}</p>
                    {!item.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ember-600" aria-label="Unread" />}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-400">{item.body}</p>
                  <p className="mt-2 text-xs text-graphite-400">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            );
            return item.url ? <Link key={item.id} href={item.url} onClick={() => { if (!item.readAt) void markRead(item.id); }}>{content}</Link> : <button key={item.id} type="button" className="block w-full text-left" onClick={() => { if (!item.readAt) void markRead(item.id); }}>{content}</button>;
          })}
        </div>
      </div>
    </main>
  );
}
