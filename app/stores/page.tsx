import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { StoreCard } from "@/components/store-card";
import type { StoreBadge, VendorTier } from "@/lib/api-types";
import { api } from "@/lib/api-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Stores",
  description: "Discover approved stores and trusted vendors on TTFL Store.",
  openGraph: {
    title: "Stores | TTFL Store",
    description: "Discover approved stores and trusted vendors on TTFL Store.",
    images: [{ url: "/ttflstore.png", width: 1200, height: 630, alt: "TTFL Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stores | TTFL Store",
    description: "Discover approved stores and trusted vendors on TTFL Store.",
    images: ["/ttflstore.png"],
  },
};

type PublicStore = {
  id: string;
  name: string;
  slug: string;
  customUrl?: string | null;
  rating: number;
  productCount: number;
  verified: boolean;
  location: string | null;
  logoUrl: string | null;
  tier?: VendorTier | string | null;
  badges?: StoreBadge[];
};

type VendorStore = {
  id: string;
  storeName: string;
  storeSlug: string;
  bio?: string | null;
  location: string | null;
  logoUrl: string | null;
  verified: boolean;
  tier?: VendorTier | string | null;
  _count?: { products?: number };
  badges?: StoreBadge[];
};

async function getStores(): Promise<PublicStore[]> {
  try {
    const response = await api.get<{ stores?: PublicStore[]; items?: VendorStore[] }>("/api/store-profile/public/directory?limit=48&page=1");
    if (response.stores?.length) return response.stores;
    if (response.items?.length) {
      return response.items.map((store) => ({
        id: store.id,
        name: store.storeName,
        slug: store.storeSlug,
        customUrl: null,
        rating: 0,
        productCount: Number(store._count?.products ?? 0),
        verified: Boolean(store.verified),
        location: store.location ?? null,
        logoUrl: store.logoUrl ?? null,
        tier: store.tier ?? null,
        badges: store.badges ?? (store.verified ? ["VERIFIED"] : []),
      }));
    }
  } catch {
    try {
      const response = await api.get<{ stores?: PublicStore[]; items?: VendorStore[] }>("/api/vendors/stores?limit=48&page=1");
      if (response.stores?.length) return response.stores;
      return (response.items ?? []).map((store) => ({
        id: store.id,
        name: store.storeName,
        slug: store.storeSlug,
        customUrl: null,
        rating: 0,
        productCount: Number(store._count?.products ?? 0),
        verified: Boolean(store.verified),
        location: store.location ?? null,
        logoUrl: store.logoUrl ?? null,
        tier: store.tier ?? null,
        badges: store.badges ?? (store.verified ? ["VERIFIED"] : []),
      }));
    } catch {
      return [];
    }
  }
  return [];
}

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <main className="shell py-7 sm:py-10">
      <div className="mb-7">
        <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-graphite-600 hover:text-ember-600">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ember-100 text-ember-600">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-graphite-900">All stores</h1>
            <p className="mt-0.5 text-sm text-graphite-600">Discover trusted vendors on TTFL Store.</p>
          </div>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="rounded-card border border-dashed border-graphite-200 p-10 text-center">
          <p className="font-semibold text-graphite-900">No approved stores yet.</p>
          <p className="mt-1 text-sm text-graphite-600">New stores will appear here once approved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </main>
  );
}
