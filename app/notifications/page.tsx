"use client";

import Link from "next/link";
import { Bell, BellRing, CheckCheck, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { enableWebPush } from "@/lib/web-push";

type NotificationProduct = { id: string; name: string; slug: string; imageUrl?: string | null; price?: number };
type NotificationButton = { label: string; url: string };

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
  const [browserPermission, setBrowserPermission] = useState<string>("default");
  const [webPushEnabled, setWebPushEnabled] = useState(false);
  const [browserMessage, setBrowserMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) setBrowserPermission(Notification.permission);
    if ("serviceWorker" in navigator) void navigator.serviceWorker.ready.then((registration) => registration.pushManager.getSubscription()).then((subscription) => { if (subscription) setWebPushEnabled(true); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    void api.get<{ notifications: Notification[] }>("/api/notifications?limit=100")
      .then((result) => setItems(result.notifications))
      .finally(() => setBusy(false));
  }, [loading, user]);

  async function enableBrowserNotifications() {
    setBrowserMessage(null);
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setBrowserMessage("This browser does not support web notifications. You can still read every update here.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission !== "granted") {
        setBrowserMessage(permission === "denied" ? "Notifications are blocked in your browser settings." : "Browser notifications were not enabled.");
        return;
      }
      const message = await enableWebPush();
      const latest = items[0];
      if (latest?.id) window.localStorage.setItem("ttfl-browser-notifications-baseline", latest.id);
      setWebPushEnabled(true);
      setBrowserMessage(message);
    } catch {
      setBrowserMessage("Could not enable browser notifications. Please try again.");
    }
  }

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
          <div className="flex flex-wrap items-center justify-end gap-2">
            {unread > 0 && <button type="button" onClick={() => void markAllRead()} className="inline-flex items-center gap-2 rounded-card border border-graphite-200 bg-white px-3 py-2 text-xs font-semibold text-graphite-700 hover:bg-cloud-100 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-200"><CheckCheck className="h-4 w-4" />Mark all read</button>}
            <button type="button" onClick={() => void enableBrowserNotifications()} disabled={webPushEnabled} className="inline-flex items-center gap-2 rounded-card bg-ember-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-ember-700 disabled:cursor-default disabled:bg-verified-700"><BellRing className="h-4 w-4" />{webPushEnabled ? "Web push enabled" : browserPermission === "granted" ? "Enable on this device" : "Enable browser alerts"}</button>
          </div>
        </div>

        {browserMessage && <p role="status" className="mt-3 rounded-card border border-graphite-200 bg-white px-4 py-3 text-sm text-graphite-700 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-200">{browserMessage}</p>}

        <div className="mt-6 overflow-hidden rounded-[24px] border border-graphite-200 bg-white shadow-sm dark:border-graphite-800 dark:bg-graphite-900">
          {items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cloud-100 text-graphite-500 dark:bg-graphite-800 dark:text-graphite-300"><Bell className="h-5 w-5" /></span>
              <h2 className="mt-4 font-semibold text-graphite-900 dark:text-white">No notifications yet</h2>
              <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Order and account updates will appear here.</p>
            </div>
          ) : items.map((item) => {
            const data = item.data ?? {};
            const productReferences = Array.isArray(data.productReferences) ? data.productReferences as NotificationProduct[] : [];
            const buttons = Array.isArray(data.buttons) ? data.buttons as NotificationButton[] : [];
            const markThisRead = () => { if (!item.readAt) void markRead(item.id); };
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
            return (
              <article key={item.id} className="border-b border-graphite-100 last:border-0 dark:border-graphite-800">
                {item.url ? <Link href={item.url} onClick={markThisRead} className="block">{content}</Link> : <button type="button" className="block w-full text-left" onClick={markThisRead}>{content}</button>}
                {productReferences.length > 0 && <div className="space-y-2 px-5 pb-4 pl-[4.5rem]">
                  {productReferences.map((product) => <a key={product.id} href={`/products/${encodeURIComponent(product.slug)}`} onClick={markThisRead} className="flex items-center gap-3 rounded-card border border-graphite-200 p-3 transition hover:border-ember-400 dark:border-graphite-700">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-14 w-14 shrink-0 rounded object-cover" /> : <span className="h-14 w-14 shrink-0 rounded bg-cloud-100 dark:bg-graphite-800" />}
                    <span className="min-w-0 flex-1"><strong className="block text-sm text-graphite-900 dark:text-white">{product.name}</strong>{typeof product.price === "number" && <span className="mt-1 block text-sm text-graphite-600 dark:text-graphite-400">₦{product.price.toLocaleString("en-NG")}</span>}<span className="mt-1 block text-xs font-semibold text-ember-700 dark:text-ember-300">View product →</span></span>
                  </a>)}
                </div>}
                {buttons.length > 0 && <div className="flex flex-wrap gap-2 px-5 pb-4 pl-[4.5rem]">{buttons.filter((button) => button && typeof button.label === "string" && typeof button.url === "string" && /^https?:\/\//i.test(button.url)).map((button, index) => <a key={index} href={button.url} target={button.url.startsWith("https://ttflstore.name.ng/") || button.url === "https://ttflstore.name.ng" ? undefined : "_blank"} rel="noreferrer" onClick={markThisRead} className="inline-flex items-center rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ember-700">{button.label} <span aria-hidden="true" className="ml-2">→</span></a>)}</div>}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
