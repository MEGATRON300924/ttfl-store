import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Store, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { SearchFilters } from "@/components/search-filters";

export const metadata: Metadata = { title: "Search results" };

type SearchParams = { q?: string; category?: string; minPrice?: string; maxPrice?: string; condition?: string; sort?: string; page?: string };
type StoreResult = { id: string; name: string; slug: string; customUrl?: string | null; logoUrl?: string | null; location?: string | null; verified: boolean; productCount?: number; rating?: number };

async function getResults(params: SearchParams) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return api.get<{ items: ApiProduct[]; pagination: { page: number; totalPages: number; total: number } }>(`/api/products?${qs.toString()}`);
}

async function getVerifiedStore(q?: string) {
  if (!q?.trim()) return null;
  try {
    const result = await api.get<{ stores: StoreResult[] }>(`/api/store-profile/public/directory?q=${encodeURIComponent(q.trim())}&limit=8&page=1`);
    return result.stores.find((store) => store.verified) ?? null;
  } catch {
    return null;
  }
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ items, pagination }, verifiedStore] = await Promise.all([getResults(searchParams), getVerifiedStore(searchParams.q)]);

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">{searchParams.q ? `Results for "${searchParams.q}"` : "Browse products"}</h1>
      <p className="mt-1 text-sm text-graphite-600">{pagination.total} products found</p>

      {verifiedStore && (
        <section className="mt-5 overflow-hidden rounded-card border border-verified-100 bg-verified-100/40" aria-label="Verified store result">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-verified-100 bg-white">
              {verifiedStore.logoUrl ? <Image src={verifiedStore.logoUrl} alt={`${verifiedStore.name} logo`} fill sizes="64px" className="object-cover" /> : <Store className="h-7 w-7 text-verified-700" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-verified-700">Verified store</p>
              <h2 className="mt-1 flex items-center gap-1.5 text-lg font-bold text-graphite-900"><span className="truncate">{verifiedStore.name}</span><BadgeCheck className="h-5 w-5 shrink-0 text-verified-600" /></h2>
              <p className="mt-1 text-sm text-graphite-600">{verifiedStore.location || "Nigeria"} · {verifiedStore.productCount ?? 0} products</p>
            </div>
            <Link href={`/store/${verifiedStore.customUrl?.trim() || verifiedStore.slug}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800">View store <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <SearchFilters initial={searchParams} />
        <div>
          {items.length === 0 ? (
            <div className="rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">No products matched your search. Try a different keyword or filter.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={mapApiProduct(p)} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function mapApiProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined,
    image: p.images[0]?.url ?? "",
    vendor: p.vendor.storeName,
    vendorSlug: p.vendor.storeSlug,
    verified: p.vendor.verified,
    location: p.location ?? p.vendor.location ?? "",
    rating: 0,
    reviewCount: 0,
    sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout" as const,
  };
}
