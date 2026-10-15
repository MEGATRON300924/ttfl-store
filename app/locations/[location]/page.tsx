import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo-jsonld";

const SITE_URL = "https://ttflstore.name.ng";
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
type SearchResponse = { items: ApiProduct[]; pagination?: { total: number } };
async function getLocationProducts(slug: string): Promise<{ location: string; products: ApiProduct[] }> {
  const location = slug.replace(/-/g, " ");
  const response = await api.get<SearchResponse>(`/api/products?location=${encodeURIComponent(location)}&limit=48&page=1&sort=newest`);
  const products = (response.items ?? []).filter((product) => {
    const productLocation = String(product.location ?? "").trim();
    const vendorLocation = String(product.vendor.location ?? "").trim();
    return [productLocation, vendorLocation].some((value) => value && slugify(value) === slug);
  });
  return { location: String(products[0]?.location && slugify(products[0].location) === slug ? products[0].location : products[0]?.vendor.location ?? location).trim(), products };
}
function mapProduct(p: ApiProduct): Product { return { id: p.id, slug: p.slug, name: p.name, price: Number(p.price), previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined, image: p.images?.[0]?.url ?? "", vendor: p.vendor.storeName, vendorSlug: p.vendor.storeSlug, verified: p.vendor.verified, location: p.location ?? p.vendor.location ?? "", rating: p.avgRating ? Number(p.avgRating) : 0, reviewCount: p.reviewCount, sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout" }; }
export async function generateMetadata({ params }: { params: { location: string } }): Promise<Metadata> {
  const result = await getLocationProducts(params.location).catch(() => null);
  const location = result?.location ?? params.location.replace(/-/g, " ");
  const title = `Products for Sale in ${location}, Nigeria`;
  const description = `Browse products for sale in ${location}, Nigeria on TTFL Store. Compare prices, product details and local sellers.`;
  return { title, description, alternates: { canonical: `${SITE_URL}/locations/${params.location}` }, openGraph: { title: `${title} | TTFL Store`, description, url: `${SITE_URL}/locations/${params.location}`, siteName: "TTFL Store", type: "website" } };
}
export default async function LocationPage({ params }: { params: { location: string } }) {
  const result = await getLocationProducts(params.location).catch(() => null);
  if (!result || !result.products.length) notFound();
  const products = result.products;
  const location = result.location;
  return <main className="shell py-8 sm:py-12">
    <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Locations", url: "/locations" }, { name: location, url: `/locations/${params.location}` }]} />
    <ItemListJsonLd name={`Products for sale in ${location}, Nigeria`} items={products.map(p => ({ name: p.name, url: `/products/${p.slug}`, image: p.images?.[0]?.url }))} />
    <nav className="text-xs text-graphite-500"><Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/locations">Locations</Link> <span aria-hidden="true">/</span> <span>{location}</span></nav>
    <h1 className="mt-3 text-3xl font-bold text-graphite-950">Products for Sale in {location}, Nigeria</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Discover products listed by sellers in {location}. Compare prices, condition, product details and seller information on TTFL Store.</p>
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{products.map(p => <ProductCard key={p.id} product={mapProduct(p)} />)}</div>
  </main>;
}
