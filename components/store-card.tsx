import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { StoreBadges, type StoreBadge } from "@/components/store-badges";
import type { VendorTier } from "@/lib/api-types";

type StoreCardStore = {
  id: string;
  name: string;
  slug: string;
  customUrl?: string | null;
  rating: number | string;
  productCount?: number;
  verified: boolean;
  location: string | null;
  logoUrl?: string | null;
  badges?: StoreBadge[];
  tier?: VendorTier | string | null;
};

function resolveBadges(store: StoreCardStore): StoreBadge[] {
  const badges = store.badges ?? [];
  const resolved = store.verified && !badges.includes("VERIFIED") ? ["VERIFIED" as StoreBadge, ...badges] : badges;
  if (resolved.length) return Array.from(new Set(resolved));
  if (store.tier === "ENTERPRISE") return ["ENTERPRISE"];
  if (store.tier === "BUSINESS") return ["BUSINESS"];
  return [];
}

export function StoreCard({ store }: { store: StoreCardStore }) {
  const logoUrl = store.logoUrl?.trim() || null;
  const productCount = store.productCount ?? 0;
  const badges = resolveBadges(store);
  const publicSlug = store.customUrl?.trim() || store.slug;

  return (
    <div className="group flex items-center gap-3 rounded-card border border-graphite-200 bg-white p-4 transition hover:border-ember-600 hover:shadow-card sm:p-4">
      <Link href={`/store/${publicSlug}`} className="relative grid h-12 w-12 shrink-0 overflow-hidden rounded-full border border-graphite-200 bg-cloud-100 sm:h-14 sm:w-14">
        {logoUrl ? <Image src={logoUrl} alt={`${store.name} logo`} fill sizes="56px" className="object-cover" /> : <span className="grid h-full w-full place-items-center bg-graphite-900 text-base font-bold text-white">{store.name.charAt(0).toUpperCase()}</span>}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/store/${publicSlug}`} className="block min-w-0">
          <p className="truncate text-sm font-semibold text-graphite-900 group-hover:text-ember-700">{store.name}</p>
        </Link>
        {badges.length > 0 && <div className="mt-1"><StoreBadges badges={badges} /></div>}
        <Link href={`/store/${publicSlug}`} className="block">
          <div className="mt-1 flex items-center gap-2 text-xs text-graphite-600">
            <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-gold-600 text-gold-600" />{Number(store.rating).toFixed(1)}</span>
            <span>{productCount} products</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-graphite-400"><MapPin className="h-3 w-3 shrink-0" />{store.location || "Nigeria"}</div>
        </Link>
      </div>
    </div>
  );
}
