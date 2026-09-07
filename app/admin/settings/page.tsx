"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

const LABELS: Record<string, string> = { featured_homepage_price_per_day: "Homepage featured price (₦/day)", featured_trending_price_per_day: "Trending featured price (₦/day)", featured_category_price_per_day: "Category featured price (₦/day)", featured_search_price_per_day: "Search featured price (₦/day)", featured_store_price_per_day: "Featured store price (₦/day)", min_payout_amount: "Minimum payout amount (₦)", whatsapp_admin_numbers: "WhatsApp order notification numbers" };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  async function load() { const { settings } = await api.get<{ settings: Record<string, string> }>("/api/settings"); setSettings(settings); }
  useEffect(() => { void load(); }, []);
  async function save(key: string, value: string) { setSavingKey(key); try { await api.put(`/api/settings/${key}`, { value }); await load(); } finally { setSavingKey(null); } }
  return <div className="shell max-w-2xl py-8"><h1 className="text-xl font-bold text-graphite-900">Platform settings</h1><p className="mt-1 text-sm text-graphite-600">Manage marketplace settings and WhatsApp order notifications.</p>{settings === null ? <p className="mt-6 text-sm text-graphite-600">Loading…</p> : <div className="mt-6 flex flex-col gap-4">{Object.entries(settings).map(([key, value]) => <SettingRow key={key} settingKey={key} label={LABELS[key] ?? key} value={value} saving={savingKey === key} onSave={(v) => void save(key, v)} />)}</div>}</div>;
}

function SettingRow({ settingKey, label, value, saving, onSave }: { settingKey: string; label: string; value: string; saving: boolean; onSave: (value: string) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  const whatsapp = settingKey === "whatsapp_admin_numbers";
  return <div className="rounded-card border border-graphite-200 p-4"><label htmlFor={settingKey} className="block text-sm font-medium text-graphite-700">{label}</label>{whatsapp && <p className="mt-1 text-xs leading-5 text-graphite-500">Enter one or more numbers separated by commas or new lines. Use international format, e.g. 2348012345678.</p>}<div className="mt-2 flex gap-2"><input id={settingKey} type={whatsapp ? "text" : "number"} value={local} onChange={(e) => setLocal(e.target.value)} className="w-full rounded-[7px] border border-graphite-200 px-3 py-2 text-sm font-mono outline-none focus:border-ember-600"/><button onClick={() => onSave(local)} disabled={saving} className="rounded-card bg-graphite-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{saving ? "…" : "Save"}</button></div></div>;
}
