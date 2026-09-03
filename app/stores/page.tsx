import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { StoreCard } from "@/components/store-card";
import type { StoreBadge, VendorTier } from "@/lib/api-types";
import { api } from "@/lib/api-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Stores | TTFL Store",
  description: "Discover approved stores and trusted vendors on TTFL Store.",
};

type PublicStore = {
  id: string;
  name: string;
  slug: string;
  rating: number;
  productCount: number;
  verified: boolean;
  location: string | null;
  logoUrl: string | null;
  tier?: VendorTier | string | null;
  badges?: StoreBadge[];
};

async function getStores(): Promise<PublicStore[]> {
  try {
    const response = await api.get<{ stores: PublicStore[] }>("/api/store-profile/public/directory?limit=48&page=1");
    return response.stores ?? [];
  } catch {
    try {
      const response = await api.get<{ stores: PublicStore[] }>("/api/vendors/stores?limit=48&page=1");
      return response.stores ?? [];
    } catch {
      return [];
    }
  }
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
