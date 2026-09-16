"use client";

import { useEffect } from "react";
import { api } from "@/lib/api-client";

const REFERRAL_CODE_KEY = "ttfl_affiliate_ref";
const REFERRAL_SESSION_KEY = "ttfl_affiliate_session";

function getOrCreateAffiliateSession() {
  const existing = localStorage.getItem(REFERRAL_SESSION_KEY);
  if (existing && existing.length >= 8 && existing.length <= 120) return existing;

  const sessionId = crypto.randomUUID();
  localStorage.setItem(REFERRAL_SESSION_KEY, sessionId);
  return sessionId;
}

export function AffiliateTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.trim().toUpperCase();
    if (!ref || ref.length < 3) return;

    localStorage.setItem(REFERRAL_CODE_KEY, ref);
    const sessionId = getOrCreateAffiliateSession();

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
  return localStorage.getItem(REFERRAL_CODE_KEY) ?? undefined;
}

export function getStoredAffiliateSession() {
  if (typeof window === "undefined") return undefined;
  const sessionId = localStorage.getItem(REFERRAL_SESSION_KEY);
  if (!sessionId || sessionId.length < 8 || sessionId.length > 120) return undefined;
  return sessionId;
}
