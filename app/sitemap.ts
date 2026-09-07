import type { MetadataRoute } from "next";
import { api } from "@/lib/api-client";
import type { ApiCategory, ApiProduct } from "@/lib/api-types";

const SITE_URL = "https://www.ttflstore.name.ng";

async function getAllProducts(): Promise<ApiProduct[]> {
  const all: ApiProduct[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await api.get<{ items: ApiProduct[]; pagination: { totalPages: number } }>(`/api/products?limit=48&page=${page}&sort=newest`);
    all.push(...res.items);
    if (page >= res.pagination.totalPages) break;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/deals", "/categories", "/featured", "/search", "/support", "/support/vendors", "/support/refunds", "/about", "/trust", "/legal/terms", "/legal/privacy", "/docs", "/sell", "/sell/pricing"];
  const staticPages = staticPaths.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: new Date(), changeFrequency: path === "/" || path === "/deals" ? "daily" as const : "weekly" as const, priority: path === "/" ? 1 : 0.7 }));
  try {
    const [categoriesRes, products] = await Promise.all([api.get<{ categories: ApiCategory[] }>("/api/categories"), getAllProducts()]);
    const categoryPages = categoriesRes.categories.flatMap((c) => [{ url: `${SITE_URL}/categories/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }, ...(c.children ?? []).map((child) => ({ url: `${SITE_URL}/categories/${child.slug}`, changeFrequency: "weekly" as const, priority: 0.5 }))]);
    const productPages = products.map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
    const storePages = Array.from(new Set(products.map((p) => p.vendor.storeSlug))).map((slug) => ({ url: `${SITE_URL}/store/${slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));
    return [...staticPages, ...categoryPages, ...productPages, ...storePages];
  } catch { return staticPages; }
}
