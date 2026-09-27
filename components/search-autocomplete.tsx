"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Search, Store, Tag, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { ApiCategory, ApiProduct } from "@/lib/api-types";

type StoreResult = {
  id: string;
  name: string;
  slug: string;
  customUrl?: string | null;
  logoUrl?: string | null;
  verified: boolean;
  categoryName?: string | null;
};

type ServiceResult = {
  id: string;
  title: string;
  slug: string;
  storeName: string;
  storeSlug: string;
  location?: string | null;
  price: number | null;
  price_type: string;
};

const QUERY_SUGGESTIONS = [
  "TTFL Store",
  "TTFL Store products",
  "TTFL Store vendors",
  "TTFL Store services",
  "TTFL Store deals",
  "TTFL Store categories",
  "Sell on TTFL Store",
];

export function SearchAutocomplete({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [stores, setStores] = useState<StoreResult[]>([]);
  const [services, setServices] = useState<ServiceResult[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const suggestions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return QUERY_SUGGESTIONS.slice(0, 5);
    return QUERY_SUGGESTIONS.filter((item) => item.toLowerCase().includes(value)).slice(0, 5);
  }, [query]);

  useEffect(() => {
    let active = true;
    const value = query.trim();

    if (value.length < 2) {
      setProducts([]);
      setStores([]);
      setServices([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = window.setTimeout(async () => {
      const [productResult, storeResult, serviceResult, categoryResult] = await Promise.allSettled([
        api.get<{ items: ApiProduct[] }>(
          `/api/products?q=${encodeURIComponent(value)}&limit=5&sort=relevance`
        ),
        api.get<{ stores: StoreResult[] }>(
          `/api/store-profile/public/directory?q=${encodeURIComponent(value)}&limit=5&page=1`
        ),
        api.get<{ services: ServiceResult[] }>(
          `/api/services?q=${encodeURIComponent(value)}&limit=5`
        ),
        api.get<{ categories: ApiCategory[] }>("/api/categories"),
      ]);

      if (!active) return;

      setProducts(productResult.status === "fulfilled" ? productResult.value.items.slice(0, 5) : []);
      setStores(storeResult.status === "fulfilled" ? storeResult.value.stores.slice(0, 5) : []);
      setServices(serviceResult.status === "fulfilled" ? serviceResult.value.services.slice(0, 5) : []);

      if (categoryResult.status === "fulfilled") {
        const lower = value.toLowerCase();
        setCategories(
          categoryResult.value.categories
            .filter((category) => category.name.toLowerCase().includes(lower))
            .slice(0, 3)
        );
      } else {
        setCategories([]);
      }

      setLoading(false);
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  function submit(value = query.trim()) {
    const next = value.trim();
    if (!next) return;
    setQuery(next);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  const hasResults =
    products.length > 0 ||
    stores.length > 0 ||
    services.length > 0 ||
    categories.length > 0;

  const showDropdown = open && query.trim().length >= 1;

  return (
    <div ref={rootRef} className={`relative ${mobile ? "w-full" : "flex-1"}`}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex w-full items-center rounded-card border border-graphite-200 bg-cloud-50 focus-within:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900"
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-graphite-600 dark:text-graphite-400" aria-hidden />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          type="search"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="ttfl-search-suggestions"
          placeholder={mobile ? "Search TTFL Store" : "Search products, services, brands or vendors"}
          className="w-full bg-transparent px-2.5 py-2.5 text-sm text-graphite-900 outline-none placeholder:text-graphite-600 dark:text-graphite-100 dark:placeholder:text-graphite-400"
        />
        {!mobile && (
          <button
            type="submit"
            className="m-1 shrink-0 rounded-[7px] bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800"
          >
            Search
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          id="ttfl-search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-auto rounded-card border border-graphite-200 bg-white shadow-xl dark:border-graphite-700 dark:bg-graphite-950"
        >
          {suggestions.length > 0 && (
            <div className="border-b border-graphite-100 p-2 dark:border-graphite-800">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-graphite-400">
                Suggestions
              </p>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => submit(suggestion)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-cloud-50 dark:hover:bg-graphite-900"
                >
                  <Search className="h-4 w-4 shrink-0 text-graphite-400" />
                  <span className="text-sm text-graphite-800 dark:text-graphite-200">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && loading && (
            <div className="px-4 py-3 text-sm text-graphite-500">Searching TTFL Store…</div>
          )}

          {query.trim().length >= 2 && !loading && !hasResults && suggestions.length === 0 && (
            <button
              type="button"
              onClick={() => submit()}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-cloud-50 dark:hover:bg-graphite-900"
            >
              <Search className="h-4 w-4" />
              <span>
                Search for <strong>{query.trim()}</strong>
              </span>
            </button>
          )}

          {query.trim().length >= 2 && !loading && categories.length > 0 && (
            <div className="border-b border-graphite-100 p-2 dark:border-graphite-800">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-graphite-400">
                Categories
              </p>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/categories/${category.slug}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-cloud-50 dark:hover:bg-graphite-900"
                >
                  <Tag className="h-4 w-4 text-ember-600" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && !loading && stores.length > 0 && (
            <div className="border-b border-graphite-100 p-2 dark:border-graphite-800">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-graphite-400">
                Stores
              </p>
              {stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/store/${store.customUrl?.trim() || store.slug}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-cloud-50 dark:hover:bg-graphite-900"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-graphite-200 bg-cloud-100 dark:border-graphite-700 dark:bg-graphite-800">
                    {store.logoUrl ? (
                      <img src={store.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-4 w-4 text-graphite-500" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <span className="truncate">{store.name}</span>
                      {store.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-verified-600" />}
                    </span>
                    <span className="block truncate text-xs text-graphite-500">
                      {store.categoryName || "TTFL Store"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && !loading && services.length > 0 && (
            <div className="border-b border-graphite-100 p-2 dark:border-graphite-800">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-graphite-400">
                Services
              </p>
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/services/${service.slug}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-cloud-50 dark:hover:bg-graphite-900"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cloud-100 dark:bg-graphite-800">
                    <Wrench className="h-4 w-4 text-ember-600" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{service.title}</span>
                    <span className="block truncate text-xs text-graphite-500">
                      {service.storeName}
                      {service.location ? ` · ${service.location}` : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && !loading && products.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-graphite-400">
                Products
              </p>
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/products/${product.slug}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-cloud-50 dark:hover:bg-graphite-900"
                >
                  <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cloud-100 dark:bg-graphite-800">
                    {product.images[0]?.url && (
                      <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{product.name}</span>
                    <span className="block truncate text-xs text-graphite-500">
                      {product.category.name} · {product.vendor.storeName}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
