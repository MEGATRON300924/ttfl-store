"use client";
import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
const SITE_URL = "https://ttflstore.name.ng";
export function ProductShareButton({ slug, productName }: { slug: string; productName: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}/products/${slug}`;
  async function copyLink() { try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }
  async function shareProduct() { if (navigator.share) { try { await navigator.share({ title: productName, text: `Check out ${productName} on TTFL Store`, url }); return; } catch {} } await copyLink(); }
  return <div className="flex shrink-0 items-center gap-1.5"><button type="button" onClick={() => void shareProduct()} className="inline-flex h-8 items-center gap-1.5 rounded-card border border-graphite-200 px-2.5 text-xs font-semibold text-graphite-700 transition hover:bg-cloud-100 dark:border-graphite-700 dark:text-graphite-200 dark:hover:bg-graphite-800" aria-label={`Share ${productName}`} title="Share product"><Share2 className="h-3.5 w-3.5"/><span className="hidden sm:inline">Share</span></button><button type="button" onClick={() => void copyLink()} className="grid h-8 w-8 place-items-center rounded-card border border-graphite-200 text-graphite-600 transition hover:bg-cloud-100 dark:border-graphite-700 dark:text-graphite-300 dark:hover:bg-graphite-800" aria-label={`Copy link for ${productName}`} title={copied ? "Link copied" : "Copy product link"}>{copied ? <Check className="h-3.5 w-3.5 text-verified-600"/> : <Copy className="h-3.5 w-3.5"/>}</button></div>;
}
