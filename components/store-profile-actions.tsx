"use client";

import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { useState } from "react";

export function StoreProfileActions({ storeName, url, whatsappNumber }: { storeName: string; url: string; whatsappNumber: string | null }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: storeName, text: "Check out " + storeName + " on TTFL Store.", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={share} className="inline-flex items-center justify-center gap-2 rounded-card border border-graphite-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-graphite-800 shadow-sm backdrop-blur transition hover:border-graphite-300 hover:bg-white">
        {copied ? <Check className="h-4 w-4 text-verified-600" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Link copied" : "Share store"}
      </button>
      <button type="button" onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-card border border-graphite-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-graphite-800 shadow-sm backdrop-blur transition hover:border-graphite-300 hover:bg-white">
        <Copy className="h-4 w-4" />
        Copy link
      </button>
      {whatsappNumber && (
        <a href={"https://wa.me/" + whatsappNumber.replace(/\D/g, "")} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-card bg-verified-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-verified-700">
          WhatsApp
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
