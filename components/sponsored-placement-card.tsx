"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BadgeCheck, Megaphone, Package, Store, Wrench } from "lucide-react";
import { api } from "@/lib/api-client";

type Campaign = {
  id: string;
  target_type: "STORE" | "PRODUCT" | "SERVICE" | "COMING_SOON";
  storeName: string;
  storeSlug: string;
  storeLogoUrl: string | null;
  storeVerified: boolean;
  productSlug: string | null;
  productName: string | null;
  serviceSlug: string | null;
  serviceTitle: string | null;
};

export function SponsoredPlacementCard({ campaign }: { campaign: Campaign }) {
  useEffect(() => {
    void api.post("/api/ads/events", {
      campaignId: campaign.id,
      eventType: "IMPRESSION",
      visitorKey: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : undefined,
    });
  }, [campaign.id]);

  const isService = campaign.target_type === "SERVICE";
  const isStore = campaign.target_type === "STORE" || (!campaign.productSlug && !campaign.serviceSlug);
  const slug = isService ? campaign.serviceSlug : campaign.productSlug;
  const title = isService ? campaign.serviceTitle : isStore ? campaign.storeName : campaign.productName;
  const href = isService ? `/services/${slug}` : isStore ? `/store/${campaign.storeSlug}` : `/products/${slug}`;
  const Icon = isService ? Wrench : isStore ? Store : Package;

  return (
    <Link
      href={href}
      onClick={() => void api.post("/api/ads/events", { campaignId: campaign.id, eventType: "CLICK" })}
      className="group flex min-w-0 items-center gap-3 rounded-card border border-graphite-200 bg-white p-3.5 transition hover:border-ember-500 dark:border-graphite-700 dark:bg-graphite-900"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-card bg-cloud-100 dark:bg-graphite-800">
        {campaign.storeLogoUrl ? <img src={campaign.storeLogoUrl} alt="" className="h-full w-full object-cover" /> : <Icon className="h-5 w-5 text-graphite-400" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5"><span className="truncate font-semibold">{title || campaign.storeName}</span></span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-graphite-500">{campaign.storeName}{campaign.storeVerified && <BadgeCheck className="h-3.5 w-3.5 text-verified-600" />}</span>
        <span className="mt-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-ember-600"><Megaphone className="h-3 w-3" /> Sponsored</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-graphite-400 transition group-hover:translate-x-1" />
    </Link>
  );
}
