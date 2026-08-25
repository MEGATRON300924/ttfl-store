import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { CategoryGrid } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import { StoreCard } from "@/components/store-card";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import {
  categories as mockCategories,
  products as mockProducts,
  stores as mockStores,
  type Product,
} from "@/lib/mock-data";

function toCardProduct(p: ApiProduct): Product {
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
    sellingMethod:
      p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : ("checkout" as const),
  };
}

async function getHomeData() {
  try {
    const [flashDeals, trending, newArrivals] = await Promise.all([
      api.get<{ items: ApiProduct[] }>("/api/products?sort=price_desc&limit=10"),
      api.get<{ items: ApiProduct[] }>("/api/products?sort=relevance&limit=12"),
      api.get<{ items: ApiProduct[] }>("/api/products?sort=newest&limit=12"),
    ]);
    return {
      live: true as const,
      flashDeals: flashDeals.items.filter((p) => p.previousPrice).map(toCardProduct),
      trending: trending.items.map(toCardProduct),
      newArrivals: newArrivals.items.map(toCardProduct),
    };
  } catch {
    // Backend not reachable (e.g. running the frontend standalone during
    // design work) — fall back to mock data rather than showing a blank
    // homepage.
    return {
      live: false as const,
      flashDeals: mockProducts.filter((p) => p.previousPrice),
      trending: [...mockProducts].sort((a, b) => b.reviewCount - a.reviewCount),
      newArrivals: [...mockProducts].reverse(),
    };
  }
}

export default async function HomePage() {
  const { flashDeals, trending, newArrivals } = await getHomeData();

  return (
    <>
      <Hero />

      <Section title="Shop by category">
        <CategoryGrid categories={mockCategories} />
      </Section>

      <Section title="Flash deals" subtitle="Prices drop for a limited time" href="/deals">
        {flashDeals.length === 0 ? (
          <EmptyState message="No active deals right now — check back soon." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {flashDeals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </Section>

      {/* Promotional banner — vendor/admin-configurable slot */}
      <section className="shell">
        <div className="flex flex-col items-start justify-between gap-4 rounded-card bg-gold-100 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-gold-600">Vendor spotlight</p>
            <p className="mt-1 text-lg font-bold text-graphite-900">Become a verified vendor and reach more buyers</p>
          </div>
          <a
            href="/sell"
            className="shrink-0 rounded-card bg-graphite-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800"
          >
            Start selling
          </a>
        </div>
      </section>

      <Section title="Trending now" subtitle="What buyers are viewing most" href="/search?sort=relevance">
        {trending.length === 0 ? (
          <EmptyState message="No products yet — be the first vendor to list something." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Verified stores" subtitle="Trusted vendors with a track record" href="/featured">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mockStores.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      </Section>

      <Section title="New arrivals" subtitle="Freshly listed this week" href="/search?sort=newest">
        {newArrivals.length === 0 ? (
          <EmptyState message="Nothing new yet." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-dashed border-graphite-200 p-8 text-center text-sm text-graphite-600">
      {message}
    </div>
  );
}
