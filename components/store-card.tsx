import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { StoreBadges, type StoreBadge } from "@/components/store-badges";

type StoreCardStore = {
  id: string;
  name: string;
  slug: string;
  rating: number | string;
  productCount?: number;
  verified: boolean;
  location: string;
  logoUrl?: string | null;
  badges?: StoreBadge[];
};

export function StoreCard({ store }: { store: StoreCardStore }) {
  const logoUrl = store.logoUrl?.trim() || null;
  const productCount = store.productCount ?? 0;
  const badges = store.badges?.length ? store.badges : store.verified ? ["VERIFIED"] : [];

  return (
    <Link href={`/store/${store.slug}`} className="group flex items-center gap-3 rounded-card border border-graphite-200 bg-white p-4 transition hover:border-ember-600 hover:shadow-card sm:p-4">
      {logoUrl ? (
        <span className="relative grid h-12 w-12 shrink-0 overflow-hidden rounded-full border border-graphite-200 bg-cloud-100 sm:h-14 sm:w-14">
          <Image src={logoUrl} alt={`${store.name} logo`} fill sizes="56px" className="object-cover" />
        </span>
      ) : (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-graphite-900 text-base font-bold text-white sm:h-14 sm:w-14">
          {store.name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-graphite-900 group-hover:text-ember-700">{store.name}</p>
        {badges.length > 0 && <div className="mt-1"><StoreBadges badges={badges} /></div>}
        <div className="mt-1 flex items-center gap-2 text-xs text-graphite-600">
          <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-gold-600 text-gold-600" />{store.rating}</span>
          <span>{productCount} products</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-graphite-400"><MapPin className="h-3 w-3 shrink-0" />{store.location}</div>
      </div>
    </Link>
  );
}
