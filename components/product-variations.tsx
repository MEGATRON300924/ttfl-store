"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Info, Plus, Trash2 } from "lucide-react";

export type ProductVariationGroup = { name: string; values: string[] };
export type ProductVariation = { key: string; label: string; options: Record<string, string>; price: string };

const PHONE_PRESETS: ProductVariationGroup[] = [
  { name: "RAM", values: [] },
  { name: "Storage", values: [] },
  { name: "Colour", values: [] },
];

function isPhoneCategory(categoryName?: string) {
  return /phone|smartphone|mobile/i.test(categoryName ?? "");
}

function makeKey(options: Record<string, string>) {
  return Object.entries(options).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `${name}:${value}`).join("|");
}

function makeCombinations(groups: ProductVariationGroup[]): ProductVariation[] {
  const active = groups.filter((group) => group.name.trim() && group.values.some(Boolean));
  if (!active.length) return [];
  let combinations: Record<string, string>[] = [{}];
  for (const group of active) {
    const values = Array.from(new Set(group.values.map((value) => value.trim()).filter(Boolean)));
    combinations = combinations.flatMap((current) => values.map((value) => ({ ...current, [group.name.trim()]: value })));
  }
  return combinations.map((options) => ({ key: makeKey(options), label: Object.values(options).join(" / "), options, price: "" }));
}

export function ProductVariations({
  categoryName,
  value,
  onChange,
}: {
  categoryName?: string;
  value: ProductVariation[];
  onChange: (value: ProductVariation[]) => void;
}) {
  const [enabled, setEnabled] = useState(value.length > 0);
  const [groups, setGroups] = useState<ProductVariationGroup[]>(() => {
    const names = Array.from(new Set(value.flatMap((variant) => Object.keys(variant.options))));
    if (!names.length) return isPhoneCategory(categoryName) ? PHONE_PRESETS : [{ name: "", values: [] }];
    return names.map((name) => ({ name, values: Array.from(new Set(value.map((variant) => variant.options[name]).filter(Boolean))) }));
  });

  useEffect(() => {
    if (!enabled && isPhoneCategory(categoryName) && groups.length === 1 && !groups[0].name) setGroups(PHONE_PRESETS);
  }, [categoryName, enabled, groups]);

  const generated = useMemo(() => makeCombinations(groups), [groups]);

  function updateGroup(index: number, patch: Partial<ProductVariationGroup>) {
    setGroups((current) => current.map((group, i) => (i === index ? { ...group, ...patch } : group)));
  }

  function addGroup() {
    setGroups((current) => [...current, { name: "", values: [] }]);
  }

  function removeGroup(index: number) {
    setGroups((current) => current.filter((_, i) => i !== index));
  }

  function addValue(index: number, raw: string) {
    const value = raw.trim();
    if (!value) return;
    setGroups((current) => current.map((group, i) => i === index && !group.values.includes(value) ? { ...group, values: [...group.values, value] } : group));
  }

  function removeValue(groupIndex: number, value: string) {
    setGroups((current) => current.map((group, i) => i === groupIndex ? { ...group, values: group.values.filter((item) => item !== value) } : group));
  }

  function syncVariants() {
    const previous = new Map(value.map((variant) => [variant.key, variant]));
    onChange(generated.map((variant) => ({ ...variant, price: previous.get(variant.key)?.price ?? "" })));
  }

  function toggle(next: boolean) {
    setEnabled(next);
    if (!next) onChange([]);
    else syncVariants();
  }

  return (
    <section className="rounded-card border border-graphite-200 bg-white p-4 dark:border-graphite-700 dark:bg-graphite-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-graphite-900 dark:text-white">Product variations <span className="font-normal text-graphite-400">(optional)</span></h3>
          <p className="mt-1 max-w-xl text-xs leading-5 text-graphite-500 dark:text-graphite-400">Let customers choose options such as RAM, storage or colour. You can give each combination its own price, or leave the price blank to use the main product price.</p>
        </div>
        <button type="button" onClick={() => toggle(!enabled)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-ember-600" : "bg-graphite-300 dark:bg-graphite-700"}`} aria-pressed={enabled} aria-label="Toggle product variations">
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`} />
        </button>
      </div>

      {enabled && <>
        <div className="mt-4 rounded-[10px] bg-cloud-50 p-3 dark:bg-graphite-900">
          <div className="flex items-start gap-2 text-xs text-graphite-600 dark:text-graphite-300"><Info className="mt-0.5 h-4 w-4 shrink-0 text-ember-600" /><p>{isPhoneCategory(categoryName) ? "For phones, start with RAM, Storage and Colour. Add or remove option groups to match what you sell." : "Add the option types your customer needs, then enter their available values."}</p></div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {groups.map((group, index) => <div key={`${index}-${group.name}`} className="rounded-[10px] border border-graphite-200 p-3 dark:border-graphite-700">
            <div className="flex items-center gap-2">
              <input value={group.name} onChange={(e) => updateGroup(index, { name: e.target.value })} placeholder="Option name (e.g. RAM)" className="min-w-0 flex-1 rounded-[7px] border border-graphite-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" />
              <button type="button" onClick={() => removeGroup(index)} className="grid h-9 w-9 place-items-center rounded-[7px] text-graphite-400 hover:bg-ember-50 hover:text-ember-600" aria-label={`Remove ${group.name || "option"}`}><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">{group.values.map((item) => <button key={item} type="button" onClick={() => removeValue(index, item)} className="rounded-full bg-cloud-100 px-2.5 py-1 text-xs font-medium text-graphite-700 hover:bg-ember-100 hover:text-ember-700 dark:bg-graphite-800 dark:text-graphite-200">{item} ×</button>)}<ValueInput onAdd={(item) => addValue(index, item)} placeholder={group.name ? `Add ${group.name.toLowerCase()} value` : "Add value"} /></div>
          </div>)}
        </div>

        <button type="button" onClick={addGroup} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ember-700 hover:text-ember-800"><Plus className="h-3.5 w-3.5" /> Add another option</button>

        {generated.length > 0 && <div className="mt-5">
          <div className="flex items-end justify-between gap-3"><div><h4 className="text-sm font-bold text-graphite-900 dark:text-white">Variant prices</h4><p className="mt-1 text-xs text-graphite-500 dark:text-graphite-400">Each row is a combination customers can select.</p></div><button type="button" onClick={syncVariants} className="text-xs font-semibold text-ember-700">Refresh combinations</button></div>
          <div className="mt-3 overflow-hidden rounded-[10px] border border-graphite-200 dark:border-graphite-700">
            <div className="hidden grid-cols-[1fr_150px] gap-3 bg-cloud-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-graphite-500 sm:grid dark:bg-graphite-900"><span>Variation</span><span>Price (₦)</span></div>
            <div className="divide-y divide-graphite-200 dark:divide-graphite-700">
              {generated.map((variant) => { const current = value.find((item) => item.key === variant.key) ?? variant; return <div key={variant.key} className="grid gap-2 px-3 py-3 sm:grid-cols-[1fr_150px] sm:items-center"><div><p className="text-sm font-semibold text-graphite-800 dark:text-white">{variant.label}</p><p className="text-[11px] text-graphite-400">Leave blank to use the main price</p></div><label className="relative"><span className="sr-only">Price for {variant.label}</span><input type="number" min="0" step="0.01" value={current.price} onChange={(e) => onChange(generated.map((item) => item.key === variant.key ? { ...item, price: e.target.value } : (value.find((saved) => saved.key === item.key) ?? item)))} placeholder="Use main price" className="w-full rounded-[7px] border border-graphite-200 bg-white px-3 py-2 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" /></label></div>; })}
            </div>
          </div>
        </div>}
        {groups.some((group) => !group.name.trim() || group.values.length === 0) && <p className="mt-3 text-xs text-ember-600">Complete each option name and add at least one value before saving variations.</p>}
      </>}
    </section>
  );
}

function ValueInput({ onAdd, placeholder }: { onAdd: (value: string) => void; placeholder: string }) {
  const [value, setValue] = useState("");
  function submit() { if (!value.trim()) return; onAdd(value); setValue(""); }
  return <div className="flex min-w-[180px] flex-1 gap-1.5"><input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); submit(); } }} placeholder={placeholder} className="min-w-0 flex-1 rounded-full border border-dashed border-graphite-300 bg-transparent px-3 py-1 text-xs outline-none focus:border-ember-600 dark:border-graphite-600 dark:text-white" /><button type="button" onClick={submit} className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-graphite-200 text-graphite-500 hover:border-ember-500 hover:text-ember-600 dark:border-graphite-700"><Plus className="h-3.5 w-3.5" /></button></div>;
}
