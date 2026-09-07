"use client";

import { useEffect, useState } from "react";
import { X, Megaphone } from "lucide-react";
import { api } from "@/lib/api-client";

const DISMISSED_KEY = "ttfl_broadcast_dismissed";

type BroadcastItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

export function BroadcastPopup() {
  const [items, setItems] = useState<BroadcastItem[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await api.get<{ items: BroadcastItem[] }>("/api/broadcast/public-popup");
        if (cancelled || !result.items?.length) return;

        const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]") as string[];
        const pending = result.items.filter((item) => !dismissed.includes(item.id));
        if (!pending.length) return;

        setItems(pending);
        setVisible(true);
      } catch {
        return;
      }
    }

    const timer = window.setTimeout(() => void load(), 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  function dismissCurrent() {
    const current = items[index];
    if (current) {
      const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]") as string[];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...new Set([...dismissed, current.id])].slice(-100)));
    }

    if (index + 1 < items.length) {
      setIndex((value) => value + 1);
      return;
    }

    setVisible(false);
  }

  if (!visible || !items.length || index >= items.length) return null;

  const item = items[index];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-graphite-950/30 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md rounded-card border border-graphite-200 bg-white p-6 shadow-2xl">
        <button onClick={dismissCurrent} className="absolute right-3 top-3 rounded-full p-2 text-graphite-500 hover:bg-cloud-100 hover:text-graphite-900" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="flex gap-4 pr-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ember-100 text-ember-700">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">TTFL Store</p>
            <h2 className="mt-1 text-lg font-bold text-graphite-900">{item.title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-graphite-700">{item.message}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-graphite-100 pt-4">
          <span className="text-xs text-graphite-400">{items.length > 1 ? `${index + 1} of ${items.length}` : "Announcement"}</span>
          <button onClick={dismissCurrent} className="rounded-card bg-graphite-900 px-4 py-2 text-sm font-semibold text-white hover:bg-graphite-800">
            {index + 1 < items.length ? "Next" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
