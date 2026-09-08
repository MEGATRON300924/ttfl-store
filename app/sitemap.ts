import type { MetadataRoute } from "next";
import { api } from "@/lib/api-client";
import type { ApiCategory, ApiProduct } from "@/lib/api-types";

const SITE_URL = "https://ttflstore.name.ng";

async function getAllProducts(): Promise<ApiProduct[]> {
  const all: ApiProduct[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await api.get<{ items: ApiProduct[]; pagination: { totalPages: number } }>(`/api/products?limit=48&page=${page}&sort=newest`);
    all.push(...res.items);
    if (page >= res.pagination.totalPages) break;
  }
  return all;
}

function locationKey(value: string | null | undefined) {
  return value?.split(",")[0]?.trim().replace(/\s+/g, " ") || "";
}

function searchUrl(params: Record<string, string>) {
  const qs = new URLSearchParams(params);
  return `${SITE_URL}/search?${qs.toString()}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/deals", "/categories", "/featured", "/search", "/support", "/support/vendors", "/support/refunds", "/about", "/trust", "/legal/terms", "/legal/privacy", "/docs", "/sell", "/sell/pricing"];
  const staticPages = staticPaths.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: new Date(), changeFrequency: path === "/" || path === "/deals" ? "daily" as const : "weekly" as const, priority: path === "/" ? 1 : 0.7 }));
  try {
    const [categoriesRes, products] = await Promise.all([api.get<{ categories: ApiCategory[] }>("/api/categories"), getAllProducts()]);
    const allCategories = categoriesRes.categories.flatMap((category) => [category, ...(category.children ?? [])]);
    const categoryPages = allCategories.map((c) => ({ url: `${SITE_URL}/categories/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));
    const productPages = products.map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
    const storePages = Array.from(new Set(products.map((p) => p.vendor.storeSlug))).map((slug) => ({ url: `${SITE_URL}/store/${slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));

    const locations = Array.from(new Set(products.flatMap((product) => [locationKey(product.location), locationKey(product.vendor.location)]).filter(Boolean))).slice(0, 60);
    const categoryNames = allCategories.map((category) => category.name).filter(Boolean);
    const priceRanges = [
      ["0", "100000"],
      ["100000", "200000"],
      ["200000", "500000"],
      ["500000", "1000000"],
      ["1000000", ""],
    ];

    const searchPages: MetadataRoute.Sitemap = [];
    for (const location of locations) {
      searchPages.push({ url: searchUrl({ location, sort: "relevance" }), changeFrequency: "daily", priority: 0.55 });
      for (const category of categoryNames) {
        searchPages.push({ url: searchUrl({ q: category, location, sort: "relevance" }), changeFrequency: "daily", priority: 0.5 });
        for (const [minPrice, maxPrice] of priceRanges) {
          searchPages.push({
            url: searchUrl({ q: category, location, ...(minPrice !== "0" ? { minPrice } : {}), ...(maxPrice ? { maxPrice } : {}), sort: "price_asc" }),
            changeFrequency: "daily",
            priority: 0.4,
          });
        }
      }
    }

    const nigeriaPricePages = categoryNames.flatMap((category) => priceRanges.map(([minPrice, maxPrice]) => ({
      url: searchUrl({ q: category, ...(minPrice !== "0" ? { minPrice } : {}), ...(maxPrice ? { maxPrice } : {}), sort: "price_asc" }),
      changeFrequency: "daily" as const,
      priority: 0.4,
    })));

    return [...staticPages, ...categoryPages, ...productPages, ...storePages, ...searchPages, ...nigeriaPricePages].slice(0, 49000);
  } catch {
    return staticPages;
  }
}
