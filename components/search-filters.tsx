"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchFilters({ initial }: { initial: Record<string, string | undefined> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(initial.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice ?? "");
  const [condition, setCondition] = useState(initial.condition ?? "");
  const [sort, setSort] = useState(initial.sort ?? "relevance");

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    minPrice ? params.set("minPrice", minPrice) : params.delete("minPrice");
    maxPrice ? params.set("maxPrice", maxPrice) : params.delete("maxPrice");
    condition ? params.set("condition", condition) : params.delete("condition");
    params.set("sort", sort);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <aside className="h-fit rounded-card border border-graphite-200 p-4">
      <h2 className="text-sm font-bold text-graphite-900">Filters</h2>

      <div className="mt-4">
        <label className="text-xs font-medium text-graphite-700">Sort by</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="mt-1 w-full rounded-[7px] border border-graphite-200 bg-white px-2.5 py-2 text-sm"
        >
          <option value="relevance">Most relevant</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-graphite-700">Price range (₦)</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-[7px] border border-graphite-200 px-2.5 py-2 text-sm"
          />
          <span className="text-graphite-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-[7px] border border-graphite-200 px-2.5 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-graphite-700">Condition</label>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {["", "NEW", "USED"].map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-graphite-700">
              <input
                type="radio"
                name="condition"
                checked={condition === c}
                onChange={() => setCondition(c)}
              />
              {c === "" ? "Any" : c === "NEW" ? "New" : "Used"}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={apply}
        className="mt-5 w-full rounded-card bg-graphite-900 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800"
      >
        Apply filters
      </button>
    </aside>
  );
}
