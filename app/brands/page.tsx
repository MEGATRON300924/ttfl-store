import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";

export const metadata: Metadata = { title: "Shop by Brand in Nigeria", description: "Discover products from popular brands on TTFL Store. Compare listings, prices and sellers across Nigeria.", alternates: { canonical: "https://ttflstore.name.ng/brands" } };
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export default async function BrandsPage() {
  let brands: string[] = [];
  try { for (let page = 1; page <= 20; page++) { const result = await api.get<{ items: ApiProduct[]; pagination: { totalPages: number } }>(`/api/products?limit=48&page=${page}&sort=newest`); brands.push(...result.items.map(p => String(p.specifications?.brand ?? "").trim()).filter(Boolean)); if (page >= result.pagination.totalPages) break; } } catch { /* Keep the page usable if the catalogue API is temporarily unavailable. */ }
  const unique = Array.from(new Map(brands.map(brand => [slugify(brand), brand])).entries()).sort((a,b) => a[1].localeCompare(b[1]));
  return <main className="shell py-8 sm:py-12"><h1 className="text-3xl font-bold text-graphite-950">Shop by Brand</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Explore products from brands listed by sellers across Nigeria.</p><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{unique.map(([slug, name]) => <Link key={slug} href={`/brands/${slug}`} className="rounded-card border border-graphite-200 bg-white p-4 font-semibold text-graphite-900 hover:border-ember-400 hover:text-ember-700">{name}</Link>)}</div></main>;
}
