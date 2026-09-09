import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import { ProductCard } from "@/components/product-card";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo-jsonld";

const SITE_URL = "https://ttflstore.name.ng";
type Category = { id: string; name: string; slug: string; children?: Category[] };

async function getCategory(slug: string) {
  const response = await api.get<{ categories: Category[] }>("/api/categories");
  return response.categories.flatMap(c => [c, ...(c.children ?? [])]).find(c => c.slug === slug);
}

async function getProducts(slug: string): Promise<ApiProduct[]> {
  const response = await api.get<{ items: ApiProduct[] }>(`/api/products?category=${encodeURIComponent(slug)}&limit=24&page=1&sort=newest`);
  return response.items ?? [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug).catch(() => undefined);
  const name = category?.name ?? params.slug.replace(/-/g, " ");
  return { title: `${name} — Buy & Sell in Nigeria`, description: `Browse ${name} products from verified and independent vendors on TTFL Store.`, alternates: { canonical: `${SITE_URL}/categories/${params.slug}` }, openGraph: { title: `${name} | TTFL Store`, description: `Browse ${name} products on TTFL Store.`, url: `${SITE_URL}/categories/${params.slug}`, images: ["/ttflstore.png"] } };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, products] = await Promise.all([getCategory(params.slug).catch(() => undefined), getProducts(params.slug).catch(() => [])]);
  const name = category?.name ?? params.slug.replace(/-/g, " ");
  const items = products.map(p => ({ name: p.name, url: `/products/${p.slug}`, image: p.images?.[0]?.url }));
  return <main className="shell py-8 sm:py-12">
    <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Categories", url: "/categories" }, { name, url: `/categories/${params.slug}` }]} />
    <ItemListJsonLd name={`${name} products`} items={items} />
    <nav className="text-xs text-graphite-500"><Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/categories">Categories</Link> <span aria-hidden="true">/</span> <span>{name}</span></nav>
    <h1 className="mt-3 text-3xl font-bold capitalize text-graphite-950">{name}</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Shop {name} from sellers across Nigeria on TTFL Store.</p>
    {products.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="mt-8 rounded-card border border-dashed border-graphite-300 p-10 text-center text-sm text-graphite-600">No products are available in this category yet.</div>}
  </main>;
}
