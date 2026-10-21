"use client";

import { useEffect } from "react";

type GoogleCustomerReviewsProps = {
  orderId: string;
  email: string;
  deliveryCountry?: string | null;
  estimatedDeliveryDate?: string | null;
  enabled: boolean;
};

declare global {
  interface Window {
    gapi?: {
      load: (name: string, callback: () => void) => void;
      surveyoptin?: {
        render: (options: {
          merchant_id: number;
          order_id: string;
          email: string;
          delivery_country: string;
          estimated_delivery_date: string;
        }) => void;
      };
    };
  }
}

export function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  deliveryCountry,
  estimatedDeliveryDate,
  enabled,
}: GoogleCustomerReviewsProps) {
  useEffect(() => {
    if (!enabled || !orderId || !email || !estimatedDeliveryDate) return;

    const date = new Date(estimatedDeliveryDate);
    if (Number.isNaN(date.getTime())) return;
    const formattedDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    let cancelled = false;
    const render = () => {
      if (cancelled || !window.gapi?.load) return;
      window.gapi.load("surveyoptin", () => {
        if (cancelled || !window.gapi?.surveyoptin) return;
        window.gapi.surveyoptin.render({
          merchant_id: 5667260602,
          order_id: orderId,
          email,
          delivery_country: /^(NG|NIGERIA)$/i.test(deliveryCountry || "") ? "NG" : (deliveryCountry || "NG").toUpperCase(),
          estimated_delivery_date: formattedDate,
        });
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-ttfl-google-reviews="true"]'
    );
    if (existingScript) {
      if (window.gapi?.load) render();
      else existingScript.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      // Google calls renderOptIn when platform.js has finished loading.
      (window as Window & { renderOptIn?: () => void }).renderOptIn = render;
      script.src = "https://apis.google.com/js/platform.js?onload=renderOptIn";
      script.async = true;
      script.defer = true;
      script.dataset.ttflGoogleReviews = "true";
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [enabled, orderId, email, deliveryCountry, estimatedDeliveryDate]);

  return null;
}
