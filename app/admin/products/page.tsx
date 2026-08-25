"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiProduct } from "@/lib/api-types";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<ApiProduct[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(query: string) {
    setProducts(null);
    const { items } = await api.get<{ items: ApiProduct[] }>(
      `/api/products/admin/list?q=${encodeURIComponent(query)}`
    );
    setProducts(items);
  }

  useEffect(() => {
    void load("");
  }, []);

  async function toggleStatus(product: ApiProduct) {
    setBusyId(product.id);
    if (product.status === "SUSPENDED") {
      await api.post(`/api/products/${product.id}/reinstate`);
    } else {
      await api.post(`/api/products/${product.id}/suspend`);
    }
    await load(q);
    setBusyId(null);
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Product moderation</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(q);
        }}
        className="mt-4 flex max-w-sm gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by product or store name"
          className="w-full rounded-[7px] border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-ember-600"
        />
        <button type="submit" className="rounded-card bg-graphite-900 px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      {products === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-card border border-graphite-200 p-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[6px] bg-cloud-100">
                {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-graphite-900">{p.name}</p>
                <p className="text-xs text-graphite-600">
                  {p.vendor.storeName} · {formatNaira(Number(p.price))} ·{" "}
                  <span className={p.status === "SUSPENDED" ? "text-ember-600" : "text-verified-600"}>
                    {p.status.toLowerCase()}
                  </span>
                </p>
              </div>
              <button
                onClick={() => toggleStatus(p)}
                disabled={busyId === p.id}
                className={`shrink-0 rounded-card px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                  p.status === "SUSPENDED"
                    ? "bg-verified-600 text-white hover:bg-verified-700"
                    : "border border-ember-600 text-ember-600 hover:bg-ember-100"
                }`}
              >
                {p.status === "SUSPENDED" ? "Reinstate" : "Suspend"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
