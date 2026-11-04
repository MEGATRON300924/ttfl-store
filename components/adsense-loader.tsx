"use client";

import { useEffect } from "react";

/**
 * Loads AdSense only on pages explicitly selected by the publisher.
 * Mount this component only on public pages with substantial, original content.
 * It is intentionally absent from the shared application layout so account,
 * checkout, cart, navigation and other transactional screens never initialise ads.
 */
export function AdSenseLoader({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    // The Europe storefront is intentionally excluded until a Google-certified
    // consent-management platform is configured for EEA/UK/Swiss visitors.
    if (!enabled || window.location.hostname === "europe.ttflstore.name.ng") return;

    const scriptId = "ttfl-adsense-loader";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2236157159704579";
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();

      // Remove Google-injected ad containers when leaving an eligible page.
      // This prevents a previously loaded Auto ads placement persisting over
      // a client-side transition into a transactional or private screen.
      document
        .querySelectorAll(
          "ins.adsbygoogle, .google-auto-placed, .adsbygoogle-noablate, iframe[id^='google_ads_iframe']",
        )
        .forEach((element) => element.remove());
    };
  }, [enabled]);

  return null;
}
