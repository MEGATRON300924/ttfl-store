"use client";

import { useEffect, useState } from "react";

export function SiteLoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    if (document.readyState === "complete") {
      const timer = window.setTimeout(hide, 250);
      return () => window.clearTimeout(timer);
    }
    window.addEventListener("load", hide, { once: true });
    const fallback = window.setTimeout(hide, 2500);
    return () => {
      window.removeEventListener("load", hide);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white dark:bg-graphite-950" role="status" aria-label="Loading TTFL Store">
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <div className="relative grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-ember-100 opacity-60" />
          <span className="absolute inset-2 animate-spin rounded-full border-2 border-ember-100 border-t-ember-600" />
          <img src="/ttflstore.png" alt="TTFL Store" className="relative h-12 w-12 rounded-xl object-contain" />
        </div>
        <div>
          <p className="text-lg font-extrabold tracking-tight text-graphite-900 dark:text-white">TTFL Store</p>
          <p className="mt-1 text-xs text-graphite-500 dark:text-graphite-400">Loading your marketplace...</p>
        </div>
      </div>
    </div>
  );
}
