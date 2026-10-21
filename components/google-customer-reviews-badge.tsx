"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    merchantwidget?: {
      start: (options: {
        position: "RIGHT_BOTTOM" | "LEFT_BOTTOM";
        sideMargin?: number;
        bottomMargin?: number;
        mobileSideMargin?: number;
        mobileBottomMargin?: number;
        region?: string;
      }) => void;
    };
  }
}

export function GoogleCustomerReviewsBadge() {
  useEffect(() => {
    let cancelled = false;
    const scriptId = "merchantWidgetScript";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    const start = () => {
      if (cancelled || !window.merchantwidget) return;
      // Follow Google's current Store Widget snippet: merchant ID is not a
      // start() option for this version of the widget.
      window.merchantwidget.start({ position: "RIGHT_BOTTOM" });
    };

    if (window.merchantwidget) {
      start();
      return () => { cancelled = true; };
    }

    if (existing) {
      existing.addEventListener("load", start, { once: true });
      return () => {
        cancelled = true;
        existing.removeEventListener("load", start);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://www.gstatic.com/shopping/merchant/merchantwidget.js";
    script.defer = true;
    script.addEventListener("load", start, { once: true });
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", start);
    };
  }, []);

  return null;
}
