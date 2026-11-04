"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GOOGLE_AD_SELECTORS =
  "ins.adsbygoogle, .google-auto-placed, .adsbygoogle-noablate, iframe[id^='google_ads_iframe']";

function clearGoogleAds() {
  document.getElementById("ttfl-adsense-loader")?.remove();
  document.querySelectorAll(GOOGLE_AD_SELECTORS).forEach((element) => element.remove());
}

/**
 * A persistent route guard for client-side navigation. If the current page
 * has not explicitly opted into AdSense, it removes injected ad elements and
 * watches for any late Auto ads insertion while the user remains on that page.
 */
export function AdSensePolicyGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const removeAdsUnlessAllowed = () => {
      if (document.body.dataset.ttflAdsAllowed === "true") return;
      clearGoogleAds();
    };

    removeAdsUnlessAllowed();

    const observer = new MutationObserver(removeAdsUnlessAllowed);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
