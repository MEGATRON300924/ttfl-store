"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

type FeaturedProductRow = {
  id: string;
  placement: string;
  durationDays: number;
  price: string;
  status: string;
  endDate: string | null;
  product: { name: string; vendor: { storeName: string } };
};

type FeaturedStoreRow = {
  id: string;
  durationDays: number;
  price: string;
  status: string;
  endDate: string | null;
  vendor: { storeName: string };
};

export default function AdminFeaturedPage() {
  const [products, setProducts] = useState<FeaturedProductRow[] | null>(null);
  const [stores, setStores] = useState<FeaturedStoreRow[] | null>(null);

  async function load() {
    const [pRes, sRes] = await Promise.all([
      api.get<{ items: FeaturedProductRow[] }>("/api/featured/products?placement=HOMEPAGE&limit=50"),
      api.get<{ items: FeaturedStoreRow[] }>("/api/featured/stores?limit=50"),
    ]);
    setProducts(pRes.items);
    setStores(sRes.items);
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancelProduct(id: string) {
    if (!confirm("Cancel this featured product listing?")) return;
    await api.post(`/api/featured/products/${id}/cancel`);
    await load();
  }

  async function cancelStore(id: string) {
    if (!confirm("Cancel this featured store listing?")) return;
    await api.post(`/api/featured/stores/${id}/cancel`);
    await load();
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Featured listings</h1>
      <p className="mt-1 text-sm text-graphite-600">
        Active paid promotions. Showing homepage placement — vendors can also promote to category/search/trending.
      </p>

      <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-graphite-600">Featured products</h2>
      {products === null ? (
        <p className="text-sm text-graphite-600">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-graphite-600">None active right now.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-card border border-graphite-200 p-3">
              <div>
                <p className="text-sm font-medium text-graphite-900">{f.product.name}</p>
                <p className="text-xs text-graphite-600">
                  {f.product.vendor.storeName} · {f.placement} · {f.durationDays}d · {formatNaira(Number(f.price))}
                </p>
              </div>
              <button
                onClick={() => cancelProduct(f.id)}
                className="rounded-card border border-ember-600 px-3 py-1.5 text-xs font-semibold text-ember-600 hover:bg-ember-100"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-graphite-600">Featured stores</h2>
      {stores === null ? (
        <p className="text-sm text-graphite-600">Loading…</p>
      ) : stores.length === 0 ? (
        <p className="text-sm text-graphite-600">None active right now.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {stores.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-card border border-graphite-200 p-3">
              <div>
                <p className="text-sm font-medium text-graphite-900">{f.vendor.storeName}</p>
                <p className="text-xs text-graphite-600">
                  {f.durationDays}d · {formatNaira(Number(f.price))}
                </p>
              </div>
              <button
                onClick={() => cancelStore(f.id)}
                className="rounded-card border border-ember-600 px-3 py-1.5 text-xs font-semibold text-ember-600 hover:bg-ember-100"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
