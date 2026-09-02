"use client";

import { useEffect } from "react";
import { api } from "@/lib/api-client";

export function AffiliateTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.trim().toUpperCase();
    if (!ref || ref.length < 3) return;

    const storageKey = "ttfl_affiliate_ref";
    localStorage.setItem(storageKey, ref);
    const sessionId = sessionStorage.getItem("ttfl_affiliate_session") ?? crypto.randomUUID();
    sessionStorage.setItem("ttfl_affiliate_session", sessionId);

    void api.post("/api/affiliates/click", {
      code: ref,
      sessionId,
      landingPath: window.location.pathname,
      source: document.referrer || undefined,
    });
  }, []);

  return null;
}

export function getStoredAffiliateCode() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("ttfl_affiliate_ref") ?? undefined;
}
