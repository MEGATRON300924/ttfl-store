"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ApiProductVariation } from "@/lib/api-types";

export function ProductVariationSelector({ variations, basePrice, onChange }: { variations: ApiProductVariation[]; basePrice: number; onChange: (variant: ApiProductVariation | null) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const variant of variations) for (const [name, value] of Object.entries(variant.options)) {
      const values = map.get(name) ?? [];
      if (!values.includes(value)) values.push(value);
      map.set(name, values);
    }
    return Array.from(map.entries());
  }, [variations]);
  const initialVariantKey = searchParams.get("variant");
  const initialVariant = variations.find((item) => item.key === initialVariantKey) ?? null;
  const [selected, setSelected] = useState<Record<string, string>>(() => initialVariant ? initialVariant.options : Object.fromEntries(groups.map(([name, values]) => [name, values[0] ?? ""])));
  useEffect(() => { const requested = searchParams.get("variant"); const requestedVariant = requested ? variations.find((item) => item.key === requested) : null; setSelected(requestedVariant ? requestedVariant.options : Object.fromEntries(groups.map(([name, values]) => [name, values[0] ?? ""]))); }, [groups, searchParams, variations]);
  const variant = useMemo(() => variations.find((item) => groups.every(([name]) => item.options[name] === selected[name])) ?? null, [groups, selected, variations]);
  useEffect(() => { onChange(variant); if (!variant) return; const current = searchParams.get("variant"); if (current === variant.key) return; const params = new URLSearchParams(searchParams.toString()); params.set("variant", variant.key); router.replace(pathname + "?" + params.toString(), { scroll: false }); }, [onChange, pathname, router, searchParams, variant]);
  if (!variations.length || !groups.length) return null;
  const displayPrice = variant?.price ? Number(variant.price) : basePrice;
  return <div className="rounded-card border border-graphite-200 bg-white p-4 dark:border-graphite-700 dark:bg-graphite-950">
    <div><h2 className="text-sm font-bold text-graphite-900 dark:text-white">Choose your options</h2><p className="mt-1 text-xs text-graphite-500 dark:text-graphite-400">Select the version you want. The price updates automatically.</p></div>
    <div className="mt-4 flex flex-col gap-4">{groups.map(([name, values]) => <label key={name} className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-graphite-700 dark:text-graphite-300">{name}</span><div className="flex flex-wrap gap-2">{values.map((value) => <button type="button" key={value} onClick={() => setSelected((current) => ({ ...current, [name]: value }))} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${selected[name] === value ? "border-ember-600 bg-ember-600 text-white" : "border-graphite-200 text-graphite-700 hover:border-ember-400 dark:border-graphite-700 dark:text-graphite-200"}`}>{value}</button>)}</div></label>)}</div>
    <div className="mt-4 flex items-center justify-between border-t border-graphite-100 pt-3 dark:border-graphite-800"><span className="text-xs text-graphite-500">Selected version</span><span className="text-sm font-bold text-graphite-900 dark:text-white">{variant?.label ?? "Choose an option"}</span></div>
    <div className="mt-1 flex items-center justify-between"><span className="text-xs text-graphite-500">Price</span><span className="font-mono text-lg font-bold text-ember-700">₦{displayPrice.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
  </div>;
}
