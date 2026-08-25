import type { Metadata } from "next";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { SearchFilters } from "@/components/search-filters";

export const metadata: Metadata = { title: "Search results" };

type SearchParams = {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sort?: string;
  page?: string;
};

async function getResults(params: SearchParams) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  return api.get<{
    items: ApiProduct[];
    pagination: { page: number; totalPages: number; total: number };
  }>(`/api/products?${qs.toString()}`);
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { items, pagination } = await getResults(searchParams);

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">
        {searchParams.q ? `Results for "${searchParams.q}"` : "Browse products"}
      </h1>
      <p className="mt-1 text-sm text-graphite-600">{pagination.total} products found</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <SearchFilters initial={searchParams} />

        <div>
          {items.length === 0 ? (
            <div className="rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">
              No products matched your search. Try a different keyword or filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={mapApiProduct(p)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The existing ProductCard component was built against lib/mock-data's
// shape — this adapts the live API shape to it rather than forking the
// card component in two directions.
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
