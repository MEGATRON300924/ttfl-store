import type { MetadataRoute } from "next";
import { api } from "@/lib/api-client";
import type { ApiCategory, ApiProduct } from "@/lib/api-types";
const SITE_URL = "https://ttflstore.name.ng";
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
async function getAllProducts(): Promise<ApiProduct[]> {
  const all: ApiProduct[] = [];
  for (let page = 1; page <= 100; page++) {
    const res = await api.get<{ items: ApiProduct[]; pagination: { totalPages: number } }>(`/api/products?limit=48&page=${page}&sort=newest`);
    all.push(...res.items);
    if (page >= res.pagination.totalPages) break;
  }
  return all;
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/deals", "/categories", "/brands", "/locations", "/featured", "/support", "/support/vendors", "/support/refunds", "/about", "/trust", "/legal/terms", "/legal/privacy", "/docs", "/sell", "/sell/pricing"];
  const staticPages = staticPaths.map(path => ({ url: `${SITE_URL}${path}`, lastModified: new Date(), changeFrequency: (path === "/" || path === "/deals" ? "daily" : "weekly") as "daily" | "weekly", priority: path === "/" ? 1 : 0.7 }));
  try {
    const [categoriesRes, products] = await Promise.all([api.get<{ categories: ApiCategory[] }>("/api/categories"), getAllProducts()]);
    const allCategories = categoriesRes.categories.flatMap(category => [category, ...(category.children ?? [])]);
    const categoryPages = allCategories.map(c => ({ url: `${SITE_URL}/categories/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 }));
    const productPages = products.filter(p => !p.comingSoon && p.status === "ACTIVE").map(p => ({ url: `${SITE_URL}/products/${p.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 }));
    const storePages = Array.from(new Set(products.map(p => p.vendor.storeSlug).filter(Boolean))).map(slug => ({ url: `${SITE_URL}/store/${slug}`, changeFrequency: "weekly" as const, priority: 0.65 }));
    const brands = Array.from(new Map(products.map(p => String(p.specifications?.brand ?? "").trim()).filter(Boolean).map(brand => [slugify(brand), brand])).entries()).filter(([slug]) => slug);
    const brandPages = brands.map(([slug]) => ({ url: `${SITE_URL}/brands/${slug}`, changeFrequency: "weekly" as const, priority: 0.65 }));
    const locations = Array.from(new Map(products.map(p => String(p.location ?? p.vendor.location ?? "").trim()).filter(Boolean).map(location => [slugify(location), location])).entries()).filter(([slug]) => slug);
    const locationPages = locations.map(([slug]) => ({ url: `${SITE_URL}/locations/${slug}`, changeFrequency: "weekly" as const, priority: 0.65 }));
    return [...staticPages, ...categoryPages, ...productPages, ...storePages, ...brandPages, ...locationPages];
  } catch {
    return staticPages;
  }
}
