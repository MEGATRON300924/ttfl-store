import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";

export const metadata: Metadata = { title: "Shop by Location in Nigeria", description: "Browse marketplace listings by seller location across Nigeria on TTFL Store.", alternates: { canonical: "https://ttflstore.name.ng/locations" } };
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export default async function LocationsPage() {
  let locations: string[] = [];
  try { for (let page = 1; page <= 20; page++) { const result = await api.get<{ items: ApiProduct[]; pagination: { totalPages: number } }>(`/api/products?limit=48&page=${page}&sort=newest`); locations.push(...result.items.map(p => String(p.location ?? p.vendor.location ?? "").trim()).filter(Boolean)); if (page >= result.pagination.totalPages) break; } } catch { /* Keep the page usable if the catalogue API is temporarily unavailable. */ }
  const unique = Array.from(new Map(locations.map(location => [slugify(location), location])).entries()).sort((a,b) => a[1].localeCompare(b[1]));
  return <main className="shell py-8 sm:py-12"><h1 className="text-3xl font-bold text-graphite-950">Shop by Location</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Discover products from sellers in cities and areas across Nigeria.</p><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{unique.map(([slug, name]) => <Link key={slug} href={`/locations/${slug}`} className="rounded-card border border-graphite-200 bg-white p-4 font-semibold text-graphite-900 hover:border-ember-400 hover:text-ember-700">{name}</Link>)}</div></main>;
}
