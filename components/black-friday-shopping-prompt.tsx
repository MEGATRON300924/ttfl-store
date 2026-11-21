"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, X } from "lucide-react";

export function BlackFridayShoppingPrompt({ product }: { product: { name: string; slug: string; price: number; previousPrice?: number; vendor: string; image: string } }) {
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
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-graphite-500 dark:text-graphite-400">Picked from Black Friday Specials</p>
          <p className="mt-1 line-clamp-1 text-sm font-extrabold text-graphite-950 dark:text-white">{product.name}</p>
          <p className="mt-1 text-xs text-graphite-500 dark:text-graphite-400">From {product.vendor}</p>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-sm font-extrabold text-graphite-950 dark:text-white">₦{Number(product.price).toLocaleString("en-NG")}</span>{product.previousPrice && <span className="text-xs text-graphite-400 line-through">₦{Number(product.previousPrice).toLocaleString("en-NG")}</span>}</div>
          <Link href={`/products/${product.slug}`} onClick={dismiss} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-graphite-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-graphite-800 dark:bg-white dark:text-graphite-950 dark:hover:bg-cloud-100">View this deal <ArrowRight className="h-3.5 w-3.5" /></Link>
          <Link href="/black-friday" onClick={dismiss} className="ml-3 text-xs font-semibold text-graphite-600 underline underline-offset-2 dark:text-graphite-300">All specials</Link>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss Black Friday recommendation" className="rounded-md p-1 text-graphite-400 transition hover:bg-cloud-100 hover:text-graphite-800 dark:hover:bg-graphite-800 dark:hover:text-white"><X className="h-4 w-4" /></button>
      </div>
    </aside>
  );
}
