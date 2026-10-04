"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type Notification = { id: string; title: string; body: string; readAt: string | null };

export function NotificationsBell() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let active = true;
    const load = async () => {
      try {
        const result = await api.get<{ notifications: Notification[] }>("/api/notifications?limit=30");
        if (active) setUnread(result.notifications.filter((item) => !item.readAt).length);
      } catch { if (active) setUnread(0); }
    };
    void load();
    const timer = window.setInterval(load, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [user]);

  if (!user) return null;

  return (
    <Link href="/notifications" className="relative grid h-8 w-8 place-items-center rounded-card text-graphite-700 hover:bg-cloud-100 dark:text-graphite-200 dark:hover:bg-graphite-800" aria-label={unread ? "Notifications (" + unread + " unread)" : "Notifications"}>
      <Bell className="h-4 w-4" />
      {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-ember-600 px-1 font-mono text-[9px] font-bold text-white">{unread > 99 ? "99+" : unread}</span>}
    </Link>
  );
}
