"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Info, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { ApiCategory, ApiCategoryVariationConfig } from "@/lib/api-types";

export type ProductVariationGroup = { name: string; values: string[] };
export type ProductVariation = { key: string; label: string; options: Record<string, string>; price: string };

function keyOf(o: Record<string, string>) {
  return Object.entries(o).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join("|");
}
function combinations(groups: ProductVariationGroup[]) {
  const active = groups.filter((g) => g.name.trim() && g.values.length);
  let rows: Record<string, string>[] = [{}];
  for (const g of active) rows = rows.flatMap((r) => g.values.map((v) => ({ ...r, [g.name.trim()]: v })));
  return rows.map((options) => ({ key: keyOf(options), label: Object.values(options).join(" / "), options, price: "" }));
}

export function ProductVariations({ categoryName, categoryConfig, value, onChange }: { categoryName?: string; categoryConfig?: ApiCategoryVariationConfig; value: ProductVariation[]; onChange: (value: ProductVariation[]) => void }) {
  const [resolvedConfig, setResolvedConfig] = useState<ApiCategoryVariationConfig | undefined>(categoryConfig);
  const effectiveConfig = categoryConfig ?? resolvedConfig;
  const [enabled, setEnabled] = useState(value.length > 0 || Boolean(effectiveConfig?.enabled));
  const [open, setOpen] = useState(value.length > 0 || Boolean(effectiveConfig?.enabled));
  const [groups, setGroups] = useState<ProductVariationGroup[]>(() => {
    const names = Array.from(new Set(value.flatMap((v) => Object.keys(v.options))));
    if (names.length) return names.map((name) => ({ name, values: Array.from(new Set(value.map((v) => v.options[name]).filter(Boolean))) }));
    if (effectiveConfig?.enabled) return effectiveConfig.variations.map((v) => ({ name: v.name, values: v.options.map((o) => o.value) }));
    return [{ name: "", values: [] }];
  });

  useEffect(() => {
    let mounted = true;
    if (categoryConfig) { setResolvedConfig(categoryConfig); return () => { mounted = false; }; }
    if (!categoryName) return;
    void api.get<{ categories: ApiCategory[] }>("/api/categories").then(({ categories }) => {
      if (!mounted) return;
      const all = categories.flatMap((c) => [c, ...(c.children ?? [])]);
      const found = all.find((c) => c.name === categoryName);
      if (found?.variationConfig) setResolvedConfig(found.variationConfig);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [categoryName, categoryConfig]);

  useEffect(() => {
    if (!value.length && effectiveConfig?.enabled) {
      setEnabled(true); setOpen(true);
      setGroups(effectiveConfig.variations.map((v) => ({ name: v.name, values: v.options.map((o) => o.value) })));
    }
  }, [effectiveConfig, value.length]);

  const generated = useMemo(() => combinations(groups), [groups]);
  useEffect(() => {
    if (!enabled) return;
    const old = new Map(value.map((v) => [v.key, v]));
    const next = generated.map((v) => ({ ...v, price: old.get(v.key)?.price ?? "" }));
    const same = next.length === value.length && next.every((v, i) => v.key === value[i]?.key && v.label === value[i]?.label && v.price === value[i]?.price && JSON.stringify(v.options) === JSON.stringify(value[i]?.options));
    if (!same) onChange(next);
  }, [generated, enabled, value, onChange]);

  const updateGroup = (i: number, p: Partial<ProductVariationGroup>) => setGroups((c) => c.map((g, n) => n === i ? { ...g, ...p } : g));
  const sync = () => { const old = new Map(value.map((v) => [v.key, v])); onChange(generated.map((v) => ({ ...v, price: old.get(v.key)?.price ?? "" }))); };
  const toggle = (next: boolean) => { setEnabled(next); setOpen(next); if (!next) onChange([]); else sync(); };

  return <section className="rounded-card border border-graphite-200 bg-white dark:border-graphite-700 dark:bg-graphite-950">
    <div className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2"><h3 className="text-base font-bold text-graphite-900 dark:text-white">Product variations</h3><span className="rounded-full bg-cloud-100 px-2 py-0.5 text-[10px] font-semibold text-graphite-600 dark:bg-graphite-800 dark:text-graphite-300">Optional</span></div>
          <p className="mt-1 text-sm leading-5 text-graphite-500 dark:text-graphite-400">Let customers choose things like size, colour, weight or yardage.</p>
        </div>
        <button type="button" onClick={() => toggle(!enabled)} aria-pressed={enabled} className={`rounded-full px-4 py-2 text-xs font-bold transition ${enabled ? "bg-ember-600 text-white" : "border border-graphite-300 bg-white text-graphite-700 dark:border-graphite-600 dark:bg-graphite-900 dark:text-graphite-200"}`}>{enabled ? "Enabled" : "Turn on variations"}</button>
      </div>
      {enabled && <button type="button" onClick={() => setOpen((v) => !v)} className="mt-3 flex w-full items-center justify-between rounded-[10px] bg-cloud-50 px-3 py-2.5 text-left dark:bg-graphite-900"><span className="text-xs font-semibold text-graphite-700 dark:text-graphite-200">{effectiveConfig?.enabled ? `Using ${categoryName ?? "category"} variation defaults` : "Set up your variation options"}</span><ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} /></button>}
    </div>
    {enabled && open && <div className="border-t border-graphite-200 p-4 dark:border-graphite-700">
      {effectiveConfig?.enabled && <div className="mb-4 flex gap-2 rounded-[10px] bg-cloud-50 p-3 text-xs leading-5 text-graphite-600 dark:bg-graphite-900 dark:text-graphite-300"><Info className="h-4 w-4 shrink-0 text-ember-600"/><span><strong>Category defaults loaded.</strong> You can use them as-is or change the options below for this product.</span></div>}
      <div className="mb-3"><p className="text-sm font-bold text-graphite-900 dark:text-white">Step 1: Add what customers can choose</p><p className="mt-1 text-xs text-graphite-500">Example: add <strong>Size</strong>, then add Small, Medium and Large.</p></div>
      <div className="flex flex-col gap-3">{groups.map((g, i) => <Group key={`${i}-${g.name}`} group={g} index={i} update={updateGroup} remove={() => setGroups((c) => c.filter((_, n) => n !== i))} addValue={(raw) => { const v = raw.trim(); if (v && !g.values.includes(v)) updateGroup(i, { values: [...g.values, v] }); }} removeValue={(v) => updateGroup(i, { values: g.values.filter((x) => x !== v) })} />)}</div>
      <button type="button" onClick={() => setGroups((c) => [...c, { name: "", values: [] }])} className="mt-3 inline-flex items-center gap-1.5 rounded-[8px] border border-dashed border-graphite-300 px-3 py-2 text-xs font-semibold text-ember-700 hover:bg-cloud-50 dark:border-graphite-600"><Plus className="h-3.5 w-3.5"/>Add another variation</button>
      {generated.length > 0 && <div className="mt-6"><div className="mb-3"><p className="text-sm font-bold text-graphite-900 dark:text-white">Step 2: Set prices</p><p className="mt-1 text-xs text-graphite-500">If every option costs the same, leave the price boxes empty.</p></div><div className="divide-y divide-graphite-200 rounded-[10px] border border-graphite-200 dark:divide-graphite-700 dark:border-graphite-700">{generated.map((v) => { const current = value.find((x) => x.key === v.key) ?? v; return <div key={v.key} className="grid gap-2 px-3 py-3 sm:grid-cols-[1fr_150px]"><div><p className="text-sm font-semibold">{v.label}</p><p className="text-[11px] text-graphite-400">Optional custom price</p></div><input aria-label={`Price for ${v.label}`} type="number" min="0" step="0.01" value={current.price} onChange={(e) => onChange(generated.map((x) => x.key === v.key ? { ...x, price: e.target.value } : (value.find((s) => s.key === x.key) ?? x)))} placeholder="Main price" className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm dark:border-graphite-700 dark:bg-graphite-950"/></div> })}</div></div>}
    </div>}
    {!enabled && <div className="border-t border-graphite-200 px-4 py-3 text-xs text-graphite-500 dark:border-graphite-700 dark:text-graphite-400">No variations? Leave this turned off. Your product will simply have one price and no options to choose.</div>}
  </section>;
}

function Group({ group, index, update, remove, addValue, removeValue }: { group: ProductVariationGroup; index: number; update: (i: number, p: Partial<ProductVariationGroup>) => void; remove: () => void; addValue: (v: string) => void; removeValue: (v: string) => void }) {
  const [input, setInput] = useState("");
  return <div className="rounded-[10px] border border-graphite-200 bg-cloud-50/50 p-3 dark:border-graphite-700 dark:bg-graphite-900/40">
    <div className="flex items-center gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ember-100 text-[10px] font-bold text-ember-700">{index + 1}</span><input value={group.name} onChange={(e) => update(index, { name: e.target.value })} placeholder="Variation name (e.g. Size, Colour, Yardage)" className="min-w-0 flex-1 rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm dark:border-graphite-700 dark:bg-graphite-950"/><button type="button" onClick={remove} aria-label="Remove variation" className="rounded p-1"><Trash2 className="h-4 w-4 text-graphite-400"/></button></div>
    <p className="ml-8 mt-2 text-[11px] text-graphite-500">Add the choices customers will see for this variation.</p>
    <div className="ml-8 mt-2 flex flex-wrap gap-2">{group.values.map((v) => <button type="button" key={v} onClick={() => removeValue(v)} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium shadow-sm dark:bg-graphite-800">{v} <span className="ml-1 text-graphite-400">×</span></button>)}<div className="flex min-w-[210px] flex-1 rounded-full border border-dashed border-graphite-300 bg-white dark:border-graphite-600 dark:bg-graphite-950"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); if (input.trim()) { addValue(input); setInput(""); } } }} placeholder={group.name ? `Add ${group.name} choice` : "Add a choice"} className="min-w-0 flex-1 rounded-full bg-transparent px-3 py-2 text-xs outline-none"/><button type="button" onClick={() => { if (input.trim()) { addValue(input); setInput(""); } }} className="grid h-8 w-8 place-items-center"><Plus className="h-3.5 w-3.5"/></button></div></div>
  </div>;
}
