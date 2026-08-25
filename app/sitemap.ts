import type { MetadataRoute } from "next";
import { api } from "@/lib/api-client";
import type { ApiCategory, ApiProduct } from "@/lib/api-types";

const SITE_URL = "https://store.thetronforge.com";

/**
 * Pulls every public, indexable slug straight from the live API — product
 * and category counts change constantly, so this can't be a static file.
 * Deliberately excludes anything robots.ts also blocks (admin, dashboards,
 * checkout, accounts) — see that file for the disallow list this mirrors.
 */
async function getAllProducts(): Promise<ApiProduct[]> {
  // The public search endpoint caps limit at 48 per page, so the sitemap
  // pages through it rather than requesting an oversized single batch.
  // Capped at 10 pages (480 products) to keep sitemap generation fast —
  // fine for now, but revisit with a dedicated sitemap-products endpoint
  // once the catalog grows past that.
  const all: ApiProduct[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await api.get<{ items: ApiProduct[]; pagination: { totalPages: number } }>(
      `/api/products?limit=48&page=${page}&sort=newest`
    );
    all.push(...res.items);
    if (page >= res.pagination.totalPages) break;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/sell`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [categoriesRes, products] = await Promise.all([
      api.get<{ categories: ApiCategory[] }>("/api/categories"),
      getAllProducts(),
    ]);

    const categoryPages: MetadataRoute.Sitemap = categoriesRes.categories.flatMap((c) => {
      const entries = [{ url: `${SITE_URL}/categories/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }];
      if (c.children) {
        entries.push(
          ...c.children.map((child) => ({
            url: `${SITE_URL}/categories/${child.slug}`,
            changeFrequency: "weekly" as const,
            priority: 0.5,
          }))
        );
      }
      return entries;
    });

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Vendor stores — dedupe since multiple products share a vendor
    const vendorSlugs = Array.from(new Set(products.map((p) => p.vendor.storeSlug)));
    const storePages: MetadataRoute.Sitemap = vendorSlugs.map((slug) => ({
      url: `${SITE_URL}/store/${slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...productPages, ...storePages];
  } catch {
    // Backend unreachable — return just the static pages rather than a
    // broken/empty sitemap.xml (a 500 here would deindex everything).
    return staticPages;
  }
}
