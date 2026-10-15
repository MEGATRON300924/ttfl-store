import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo-jsonld";
import Link from "next/link";

const SITE_URL = "https://ttflstore.name.ng";
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
type SearchResponse = { items: ApiProduct[]; pagination?: { total: number } };
async function getBrandProducts(slug: string): Promise<{ brand: string; products: ApiProduct[]; total: number }> {
  const response = await api.get<SearchResponse>(`/api/products?q=${encodeURIComponent(slug.replace(/-/g, " "))}&limit=48&page=1&sort=newest`);
  const products = (response.items ?? []).filter((product) => {
    const brand = String(product.specifications?.brand ?? "").trim();
    return brand && slugify(brand) === slug;
  });
  const brand = String(products[0]?.specifications?.brand ?? slug.replace(/-/g, " ")).trim();
  return { brand, products, total: products.length };
}
function mapProduct(p: ApiProduct): Product { return { id: p.id, slug: p.slug, name: p.name, price: Number(p.price), previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined, image: p.images?.[0]?.url ?? "", vendor: p.vendor.storeName, vendorSlug: p.vendor.storeSlug, verified: p.vendor.verified, location: p.location ?? p.vendor.location ?? "", rating: p.avgRating ? Number(p.avgRating) : 0, reviewCount: p.reviewCount, sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout" }; }
export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const result = await getBrandProducts(params.brand).catch(() => null);
  const brand = result?.brand ?? params.brand.replace(/-/g, " ");
  const title = `${brand} Products in Nigeria`;
  const description = `Shop ${brand} products in Nigeria on TTFL Store. Compare listings, prices, product details and sellers.`;
  return { title, description, alternates: { canonical: `${SITE_URL}/brands/${params.brand}` }, openGraph: { title: `${title} | TTFL Store`, description, url: `${SITE_URL}/brands/${params.brand}`, siteName: "TTFL Store", type: "website" } };
}
export default async function BrandPage({ params }: { params: { brand: string } }) {
  const result = await getBrandProducts(params.brand).catch(() => null);
  if (!result || !result.products.length) notFound();
  const products = result.products;
  const brand = result.brand;
  const mapped = products.map(mapProduct);
  return <main className="shell py-8 sm:py-12">
    <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Brands", url: "/brands" }, { name, url: `/brands/${params.brand}` }]} />
    <ItemListJsonLd name={`${brand} products in Nigeria`} items={products.map(p => ({ name: p.name, url: `/products/${p.slug}`, image: p.images?.[0]?.url }))} />
    <nav className="text-xs text-graphite-500"><Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/brands">Brands</Link> <span aria-hidden="true">/</span> <span>{brand}</span></nav>
    <h1 className="mt-3 text-3xl font-bold text-graphite-950">{brand} Products in Nigeria</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Explore {brand} listings from sellers across Nigeria. Compare product details, prices, availability and seller locations on TTFL Store.</p>
    <p className="mt-2 text-xs text-graphite-500">{products.length} matching listings on this page</p>
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{mapped.map(p => <ProductCard key={p.id} product={p} />)}</div>
  </main>;
}
