import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { CategoryGrid } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import { StoreCard } from "@/components/store-card";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import { categories as mockCategories, products as mockProducts, type Product } from "@/lib/mock-data";
import type { StoreBadge } from "@/components/store-badges";
import Link from "next/link";
import { ArrowRight, Search, Store } from "lucide-react";

type PublicStore = {
  id: string;
  name: string;
  slug: string;
  rating: number;
  productCount: number;
  verified: boolean;
  location: string | null;
  logoUrl: string | null;
  badges: StoreBadge[];
};

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
    sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout",
  };
}

async function getHomeData() {
  try {
    const [flashDeals, trending, newArrivals, stores] = await Promise.all([
      api.get<{ items: ApiProduct[] }>("/api/products?sort=price_desc&limit=10"),
      api.get<{ items: ApiProduct[] }>("/api/products?sort=relevance&limit=12"),
      api.get<{ items: ApiProduct[] }>("/api/products?sort=newest&limit=12"),
      api.get<{ stores: PublicStore[] }>("/api/store-profile/public/directory?limit=4&page=1"),
    ]);
    return {
      flashDeals: flashDeals.items.filter((p) => p.previousPrice).map(toCardProduct),
      trending: trending.items.map(toCardProduct),
      newArrivals: newArrivals.items.map(toCardProduct),
      stores: stores.stores,
    };
  } catch {
    return {
      flashDeals: mockProducts.filter((p) => p.previousPrice),
      trending: [...mockProducts].sort((a, b) => b.reviewCount - a.reviewCount),
      newArrivals: [...mockProducts].reverse(),
      stores: [],
    };
  }
}

export default async function HomePage() {
  const { flashDeals, trending, newArrivals, stores } = await getHomeData();

  return (
    <>
      <Hero />

      <section className="shell mt-4 sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/search" className="flex items-center justify-between rounded-card border border-graphite-200 bg-white p-3 text-sm font-semibold text-graphite-900">
            <span className="flex items-center gap-2"><Search className="h-4 w-4 text-ember-600" />Search</span><ArrowRight className="h-4 w-4 text-graphite-400" />
          </Link>
          <Link href="/stores" className="flex items-center justify-between rounded-card border border-graphite-200 bg-white p-3 text-sm font-semibold text-graphite-900">
            <span className="flex items-center gap-2"><Store className="h-4 w-4 text-ember-600" />Stores</span><ArrowRight className="h-4 w-4 text-graphite-400" />
          </Link>
        </div>
      </section>

      <Section title="Shop by category">
        <CategoryGrid categories={mockCategories} />
      </Section>

      <Section title="Flash deals" subtitle="Prices drop for a limited time" href="/deals">
        {flashDeals.length === 0 ? <EmptyState message="No active deals right now — check back soon." /> : <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">{flashDeals.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </Section>

      <section className="shell">
        <div className="flex flex-col items-start justify-between gap-4 rounded-card bg-gold-100 p-5 sm:flex-row sm:items-center sm:p-6">
          <div><p className="text-[13px] font-semibold uppercase tracking-wide text-gold-600">Vendor spotlight</p><p className="mt-1 text-base font-bold text-graphite-900 sm:text-lg">Become a verified vendor and reach more buyers</p></div>
          <Link href="/sell" className="w-full rounded-card bg-graphite-900 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-graphite-800 sm:w-auto">Start selling</Link>
        </div>
      </section>

      <Section title="Trending now" subtitle="What buyers are viewing most" href="/search?sort=relevance">
        {trending.length === 0 ? <EmptyState message="No products yet — be the first vendor to list something." /> : <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">{trending.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </Section>

      <Section title="Trusted stores" subtitle="Stores with verified and premium badges" href="/stores" hrefLabel="See all stores">
        {stores.length === 0 ? <EmptyState message="No approved stores yet. Check back soon." /> : <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">{stores.map((store) => <StoreCard key={store.id} store={store} />)}</div>}
      </Section>

      <Section title="New arrivals" subtitle="Freshly listed this week" href="/search?sort=newest">
        {newArrivals.length === 0 ? <EmptyState message="Nothing new yet." /> : <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">{newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </Section>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-card border border-dashed border-graphite-200 p-8 text-center text-sm text-graphite-600">{message}</div>;
}
