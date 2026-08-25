import Link from "next/link";
import { BadgeCheck, Star, MapPin } from "lucide-react";
import type { Store } from "@/lib/mock-data";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      href={`/store/${store.slug}`}
      className="flex items-center gap-3 rounded-card border border-graphite-200 bg-white p-4 transition hover:border-ember-600 hover:shadow-card"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-graphite-900 font-sans text-base font-bold text-white">
        {store.name.charAt(0)}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-semibold text-graphite-900">{store.name}</p>
          {store.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-verified-600" />}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-graphite-600">
          <span className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-gold-600 text-gold-600" />
            {store.rating}
          </span>
          <span>{store.productCount} products</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-graphite-400">
          <MapPin className="h-3 w-3" />
          {store.location}
        </div>
      </div>
    </Link>
  );
}
