"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, X } from "lucide-react";

export function BlackFridayShoppingPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ttfl-black-friday-prompt-dismissed") === "1") return;
    } catch {}
    const timer = window.setTimeout(() => setVisible(true), 18000);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    try { sessionStorage.setItem("ttfl-black-friday-prompt-dismissed", "1"); } catch {}
  }

  if (!visible) return null;
  return (
    <aside aria-label="Black Friday shopping recommendation" className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))] animate-in slide-in-from-bottom-3 rounded-2xl border border-graphite-200 bg-white p-4 shadow-2xl dark:border-graphite-700 dark:bg-graphite-900">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-graphite-950 text-white dark:bg-white dark:text-graphite-950"><Flame className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-graphite-950 dark:text-white">Black Friday Specials are live</p>
          <p className="mt-1 text-xs leading-5 text-graphite-600 dark:text-graphite-300">Take a look at limited-time prices from participating TTFL Store vendors before the offers end.</p>
          <Link href="/black-friday" onClick={dismiss} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-graphite-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-graphite-800 dark:bg-white dark:text-graphite-950 dark:hover:bg-cloud-100">Explore specials <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss Black Friday recommendation" className="rounded-md p-1 text-graphite-400 transition hover:bg-cloud-100 hover:text-graphite-800 dark:hover:bg-graphite-800 dark:hover:text-white"><X className="h-4 w-4" /></button>
      </div>
    </aside>
  );
}
