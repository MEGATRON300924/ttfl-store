"use client";

import { useEffect } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type NotificationItem = { id: string; title: string; body: string; url: string | null; createdAt: string };

const BASELINE_KEY = "ttfl-browser-notifications-baseline";

export function BrowserNotificationListener() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;
    let active = true;
    let timer: number | undefined;

    async function poll() {
      try {
        const response = await api.get<{ notifications: NotificationItem[] }>("/api/notifications?limit=20");
        if (!active) return;
        const items = response.notifications ?? [];
        const baseline = window.localStorage.getItem(BASELINE_KEY);
        if (!baseline) {
          if (items[0]?.id) window.localStorage.setItem(BASELINE_KEY, items[0].id);
          return;
        }
        const baselineIndex = items.findIndex((item) => item.id === baseline);
        const fresh = baselineIndex < 0 ? [] : items.slice(0, baselineIndex).reverse();
        const registration = "serviceWorker" in navigator
          ? await navigator.serviceWorker.getRegistration("/")
          : undefined;
        if (registration && await registration.pushManager.getSubscription()) {
          if (items[0]?.id) window.localStorage.setItem(BASELINE_KEY, items[0].id);
          return;
        }
        for (const item of fresh) {
          if (!active || !registration) break;
          await registration.showNotification(item.title, {
            body: item.body,
            icon: "/ttflstore.png",
            badge: "/ttflstore.png",
            tag: "ttfl-" + item.id,
            data: { url: item.url || "/notifications" },
          });
        }
        if (items[0]?.id) window.localStorage.setItem(BASELINE_KEY, items[0].id);
      } catch {
        // Notifications are optional; keep the storefront usable if the API or browser feature is unavailable.
      }
    }

    void poll();
    timer = window.setInterval(() => { if (document.visibilityState === "visible") void poll(); }, 30000);
    return () => { active = false; if (timer !== undefined) window.clearInterval(timer); };
  }, [user]);

  return null;
}
