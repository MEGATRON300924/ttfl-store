"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    merchantwidget?: {
      start: (options: { merchant_id: number; position?: string; region?: string }) => void;
    };
  }
}

export function GoogleCustomerReviewsBadge() {
  useEffect(() => {
    const existing = document.getElementById("merchantWidgetScript") as HTMLScriptElement | null;
    const start = () => {
      if (!window.merchantwidget) return;
      window.merchantwidget.start({
        merchant_id: 5667260602,
        position: "RIGHT_BOTTOM",
      });
    };

    if (window.merchantwidget) {
      start();
      return;
    }

    if (existing) {
      existing.addEventListener("load", start, { once: true });
      return () => existing.removeEventListener("load", start);
    }

    const script = document.createElement("script");
    script.id = "merchantWidgetScript";
    script.src = "https://www.gstatic.com/shopping/merchant/merchantwidget.js";
    script.defer = true;
    script.addEventListener("load", start, { once: true });
    document.head.appendChild(script);
    return () => script.removeEventListener("load", start);
  }, []);

  return null;
}
