import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api-client";
import type {
  ApiCategory,
  ApiProduct,
} from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { ProductsPerPage } from "@/components/products-per-page";

type SearchParams = {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sort?: string;
  page?: string;
  limit?: string;
};

function mapApiProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    previousPrice: p.previousPrice
      ? Number(p.previousPrice)
      : undefined,
    image: p.images[0]?.url ?? "",
    vendor: p.vendor.storeName,
    vendorSlug: p.vendor.storeSlug,
    verified: p.vendor.verified,
    location: p.location ?? p.vendor.location ?? "",
    rating: p.avgRating ? Number(p.avgRating) : 0,
    reviewCount: p.reviewCount,
    sellingMethod:
      p.sellingMethod === "EXTERNAL_LINK"
        ? "external"
        : p.sellingMethod === "WHATSAPP"
          ? "whatsapp"
          : ("checkout" as const),
  };
}

async function getProducts(params: SearchParams) {
  const qs = new URLSearchParams();

  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.minPrice) qs.set("minPrice", params.minPrice);
  if (params.maxPrice) qs.set("maxPrice", params.maxPrice);
  if (params.condition) qs.set("condition", params.condition);

  qs.set("sort", params.sort || "newest");
  qs.set("page", params.page || "1");
  qs.set("limit", params.limit || "24");

  return api.get<{
    items: ApiProduct[];
    pagination: {
      page: number;
      totalPages: number;
      total: number;
      limit?: number;
    };
  }>(`/api/products?${qs.toString()}`);
}

async function getCategories() {
  try {
    const result = await api.get<
      ApiCategory[] | { items: ApiCategory[] }
    >("/api/categories");

    return Array.isArray(result)
      ? result
      : result.items;
  } catch {
    return [];
  }
}

function buildShopUrl(
  current: SearchParams,
  updates: Record<string, string | undefined>
) {
  const merged: SearchParams = {
    ...current,
    ...updates,
  };

  const params = new URLSearchParams();

  if (merged.q) params.set("q", merged.q);
  if (merged.category) params.set("category", merged.category);
  if (merged.minPrice) params.set("minPrice", merged.minPrice);
  if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
  if (merged.condition) params.set("condition", merged.condition);
  if (merged.sort) params.set("sort", merged.sort);
  if (merged.page) params.set("page", merged.page);
  if (merged.limit) params.set("limit", merged.limit);

  const query = params.toString();

  return query ? `/shop?${query}` : "/shop";
}

function getPageNumbers(
  currentPage: number,
  totalPages: number
) {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage);

  if (currentPage > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1);
  }

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return Array.from(pages)
    .filter(
      (page) =>
        page >= 1 &&
        page <= totalPages
    )
    .sort((a, b) => a - b);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [productResult, categories] =
    await Promise.all([
      getProducts(searchParams),
      getCategories(),
    ]);

  const products = productResult.items.map(
    mapApiProduct
  );

  const pagination = productResult.pagination;

  const currentPage =
    pagination.page ||
    Number(searchParams.page || "1");

  const totalPages =
    pagination.totalPages || 1;

  const limit =
    Number(searchParams.limit || "24");

  const selectedCategory =
    searchParams.category || "";

  const selectedCategoryData =
    categories.find(
      (category) =>
        category.slug === selectedCategory
    );

  const pageNumbers = getPageNumbers(
    currentPage,
    totalPages
  );

  return (
    <div className="shell py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">
            TTFL Store
          </p>

          <h1 className="mt-1 text-2xl font-bold text-graphite-900">
            {selectedCategoryData?.name ||
              "Shop"}
          </h1>

          <p className="mt-1 text-sm text-graphite-600">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "product"
              : "products"}{" "}
            available
          </p>
        </div>

        <Link
          href="/search"
          className="inline-flex w-fit items-center gap-2 rounded-card border border-graphite-200 bg-white px-4 py-2.5 text-sm font-semibold text-graphite-700 hover:border-ember-600 hover:text-ember-600"
        >
          <SlidersHorizontal className="h-4 w-4" />
          More filters
        </Link>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mt-6 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            <Link
              href={buildShopUrl(
                searchParams,
                {
                  category: undefined,
                  page: "1",
                }
              )}
              className={[
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                !selectedCategory
                  ? "border-graphite-900 bg-graphite-900 text-white"
                  : "border-graphite-200 bg-white text-graphite-700 hover:border-ember-600 hover:text-ember-600",
              ].join(" ")}
            >
              All products
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={buildShopUrl(
                  searchParams,
                  {
                    category: category.slug,
                    page: "1",
                  }
                )}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  selectedCategory ===
                  category.slug
                    ? "border-graphite-900 bg-graphite-900 text-white"
                    : "border-graphite-200 bg-white text-graphite-700 hover:border-ember-600 hover:text-ember-600",
                ].join(" ")}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 rounded-card border border-graphite-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-graphite-600">
          {pagination.total === 0
            ? "No products"
            : `Page ${currentPage} of ${totalPages}`}
        </p>

        <ProductsPerPage value={limit} />
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-graphite-200 p-12 text-center">
          <h2 className="text-lg font-bold text-graphite-900">
            No products found
          </h2>

          <p className="mt-2 text-sm text-graphite-600">
            {selectedCategoryData
              ? `There are no active products in ${selectedCategoryData.name} yet.`
              : "There are no active products available right now."}
          </p>

          {selectedCategory && (
            <Link
              href="/shop"
              className="mt-5 inline-flex rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800"
            >
              Browse all products
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-1.5"
          aria-label="Shop pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={buildShopUrl(
                searchParams,
                {
                  page: String(
                    currentPage - 1
                  ),
                }
              )}
              className="grid h-10 w-10 place-items-center rounded-card border border-graphite-200 bg-white text-graphite-700 hover:border-ember-600 hover:text-ember-600"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-card border border-graphite-100 bg-cloud-100 text-graphite-300">
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}

          {pageNumbers.map(
            (page, index) => {
              const previous =
                pageNumbers[index - 1];

              const needsEllipsis =
                index > 0 &&
                previous !== undefined &&
                page - previous > 1;

              return (
                <div
                  key={page}
                  className="flex items-center gap-1.5"
                >
                  {needsEllipsis && (
                    <span className="px-1 text-sm text-graphite-400">
                      …
                    </span>
                  )}

                  <Link
                    href={buildShopUrl(
                      searchParams,
                      {
                        page: String(page),
                      }
                    )}
                    className={[
                      "grid h-10 min-w-10 place-items-center rounded-card border px-3 text-sm font-semibold transition",
                      page === currentPage
                        ? "border-graphite-900 bg-graphite-900 text-white"
                        : "border-graphite-200 bg-white text-graphite-700 hover:border-ember-600 hover:text-ember-600",
                    ].join(" ")}
                  >
                    {page}
                  </Link>
                </div>
              );
            }
          )}

          {currentPage < totalPages ? (
            <Link
              href={buildShopUrl(
                searchParams,
                {
                  page: String(
                    currentPage + 1
                  ),
                }
              )}
              className="grid h-10 w-10 place-items-center rounded-card border border-graphite-200 bg-white text-graphite-700 hover:border-ember-600 hover:text-ember-600"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-card border border-graphite-100 bg-cloud-100 text-graphite-300">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
