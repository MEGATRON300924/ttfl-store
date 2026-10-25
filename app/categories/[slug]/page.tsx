import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { SponsoredPlacementCard } from "@/components/sponsored-placement-card";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo-jsonld";

const SITE_URL = "https://ttflstore.name.ng";
type Category = { id: string; name: string; slug: string; children?: Category[] };
type SponsoredCampaign = { id: string; target_type: "STORE" | "PRODUCT" | "SERVICE" | "COMING_SOON"; storeName: string; storeSlug: string; storeLogoUrl: string | null; storeVerified: boolean; productSlug: string | null; productName: string | null; serviceSlug: string | null; serviceTitle: string | null };
function mapProduct(p: ApiProduct): Product { return { id: p.id, slug: p.slug, name: p.name, price: Number(p.price), previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined, image: p.images?.[0]?.url ?? "", vendor: p.vendor.storeName, vendorSlug: p.vendor.storeSlug, verified: p.vendor.verified, location: p.location ?? p.vendor.location ?? "", rating: p.avgRating ? Number(p.avgRating) : 0, reviewCount: p.reviewCount, sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout" }; }
async function getCategory(slug: string) { const response = await api.get<{ categories: Category[] }>("/api/categories"); return response.categories.flatMap(c => [c, ...(c.children ?? [])]).find(c => c.slug === slug); }
async function getProducts(slug: string): Promise<ApiProduct[]> { const response = await api.get<{ items: ApiProduct[] }>(`/api/products?category=${encodeURIComponent(slug)}&limit=24&page=1&sort=newest`); return response.items ?? []; }
async function getSponsored(slug: string): Promise<SponsoredCampaign[]> { try { const response = await api.get<{ campaigns: SponsoredCampaign[] }>(`/api/ads/active?category=${encodeURIComponent(slug)}`); return response.campaigns ?? []; } catch { return []; } }

function getCategoryHeading(slug: string, categoryName: string) {
  // Use shopper language for this important search landing page, even if the
  // backend category label is shorter or internally named.
  if (slug === "computers") return "Laptops and Computers for Sale in Nigeria";
  return categoryName;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug).catch(() => undefined);
  if (!category) return { title: "Category not found", robots: { index: false, follow: true } };
  const heading = getCategoryHeading(params.slug, category.name);
  const isComputers = params.slug === "computers";
  const title = isComputers
    ? "Laptops & Computers for Sale in Nigeria | TTFL Store"
    : `${heading} for Sale in Nigeria | TTFL Store`;
  const description = isComputers
    ? "Shop laptops, desktop computers, gaming PCs and computer accessories for sale in Nigeria. Compare listings and prices from sellers on TTFL Store."
    : `Browse ${heading.toLowerCase()} for sale in Nigeria. Discover listings from sellers across the country on TTFL Store.`;
  const canonical = `${SITE_URL}/categories/${params.slug}`;
  return {
    title,
    description,
    keywords: isComputers
      ? ["laptops for sale in Nigeria", "computers for sale in Nigeria", "buy laptop Nigeria", "desktop computers Nigeria", "gaming PCs Nigeria", "computer accessories Nigeria"]
      : [heading, `${heading} for sale in Nigeria`, `buy ${heading.toLowerCase()} in Nigeria`],
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "TTFL Store",
      title,
      description,
      url: canonical,
      images: [{ url: "/ttflstore.png", width: 1200, height: 630, alt: "TTFL Store" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/ttflstore.png"],
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, products, sponsored] = await Promise.all([
    getCategory(params.slug).catch(() => undefined),
    getProducts(params.slug).catch(() => []),
    getSponsored(params.slug),
  ]);
  if (!category) notFound();
  const heading = getCategoryHeading(params.slug, category.name);
  const mapped = products.map(mapProduct);
  const description = params.slug === "computers"
    ? "Browse laptops, desktop computers, gaming PCs and computer accessories listed by sellers across Nigeria. Compare available products and prices before you buy."
    : `Shop ${heading} from sellers across Nigeria on TTFL Store.`;
  return <main className="shell py-8 sm:py-12">
    <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Categories", url: "/categories" }, { name: heading, url: `/categories/${params.slug}` }]} />
    <ItemListJsonLd name={`${heading} for sale`} items={products.map(p => ({ name: p.name, url: `/products/${p.slug}`, image: p.images?.[0]?.url }))} />
    <nav className="text-xs text-graphite-500"><Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/categories">Categories</Link> <span aria-hidden="true">/</span> <span>{heading}</span></nav>
    <h1 className="mt-3 text-3xl font-bold capitalize text-graphite-950">{heading}</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">{description}</p>
    {sponsored.length > 0 && <section aria-label={`Sponsored ${heading} results`} className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-graphite-900">Sponsored in {heading}</h2><span className="text-[11px] font-semibold uppercase tracking-wide text-ember-600">Paid placement</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sponsored.slice(0, 6).map(c => <SponsoredPlacementCard key={c.id} campaign={c} />)}</div></section>}
    {mapped.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{mapped.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="mt-8 rounded-card border border-dashed border-graphite-300 p-10 text-center text-sm text-graphite-600">No products are available in this category yet.</div>}
  </main>;
}
