"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Save, Settings } from "lucide-react";
import { api } from "@/lib/api-client";

const LABELS: Record<string, string> = { featured_homepage_price_per_day: "Homepage featured price (₦/day)", featured_trending_price_per_day: "Trending featured price (₦/day)", featured_category_price_per_day: "Category featured price (₦/day)", featured_search_price_per_day: "Search featured price (₦/day)", featured_store_price_per_day: "Featured store price (₦/day)", min_payout_amount: "Minimum payout amount (₦)" };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [whatsappNumbers, setWhatsappNumbers] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);

  async function load() {
    const result = await api.get<{ settings: Record<string, string> }>("/api/settings");
    setSettings(result.settings);
    setWhatsappNumbers(result.settings.whatsapp_admin_numbers ?? "");
  }

  useEffect(() => { void load(); }, []);

  async function save(key: string, value: string) {
    setSavingKey(key);
    try {
      await api.put(`/api/settings/${key}`, { value });
      await load();
    } finally {
      setSavingKey(null);
    }
  }

  async function saveWhatsAppNumbers() {
    setSavingKey("whatsapp_admin_numbers");
    setWhatsappMessage(null);
    try {
      const cleaned = whatsappNumbers
        .split(/[,\n]/)
        .map((number) => number.trim())
        .filter(Boolean)
        .join(",");
      await api.put("/api/settings/whatsapp_admin_numbers", { value: cleaned });
      setWhatsappNumbers(cleaned);
      setWhatsappMessage("WhatsApp admin numbers saved successfully.");
    } catch {
      setWhatsappMessage("Could not save the WhatsApp admin numbers.");
    } finally {
      setSavingKey(null);
    }
  }

  if (settings === null) return <div className="shell max-w-3xl py-8"><p className="text-sm text-graphite-600">Loading…</p></div>;

  return <div className="shell max-w-3xl py-8">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Settings className="h-5 w-5" /></span>
      <div><h1 className="text-xl font-bold text-graphite-900">Platform settings</h1><p className="mt-1 text-sm text-graphite-600">Manage marketplace settings and WhatsApp notifications.</p></div>
    </div>

    <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><MessageCircle className="h-5 w-5" /></span>
        <div><h2 className="font-bold text-graphite-900">WhatsApp admin numbers</h2><p className="mt-1 text-sm leading-6 text-graphite-600">These numbers receive TTFL Store admin WhatsApp notifications and WhatsApp test messages.</p></div>
      </div>
      <label htmlFor="whatsapp-admin-numbers" className="mt-5 block text-sm font-medium text-graphite-700">Admin WhatsApp numbers</label>
      <textarea id="whatsapp-admin-numbers" value={whatsappNumbers} onChange={(event) => setWhatsappNumbers(event.target.value)} placeholder="2348012345678\n2348098765432" rows={4} className="mt-2 w-full resize-y rounded-card border border-graphite-200 bg-white px-3 py-3 text-sm font-mono text-graphite-900 outline-none focus:border-ember-600" />
      <p className="mt-2 text-xs leading-5 text-graphite-500">Use international format without spaces. Add multiple numbers on separate lines or separated by commas. Example: 2348012345678.</p>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={() => void saveWhatsAppNumbers()} disabled={savingKey === "whatsapp_admin_numbers"} className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />{savingKey === "whatsapp_admin_numbers" ? "Saving…" : "Save WhatsApp numbers"}</button>
        {whatsappMessage && <p className="text-xs text-verified-700">{whatsappMessage}</p>}
      </div>
    </section>

    <div className="mt-6 flex flex-col gap-4">
      {Object.entries(settings).filter(([key]) => key !== "whatsapp_admin_numbers").map(([key, value]) => <SettingRow key={key} settingKey={key} label={LABELS[key] ?? key} value={value} saving={savingKey === key} onSave={(v) => void save(key, v)} />)}
    </div>
  </div>;
}

function SettingRow({ settingKey, label, value, saving, onSave }: { settingKey: string; label: string; value: string; saving: boolean; onSave: (value: string) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return <div className="rounded-card border border-graphite-200 bg-white p-4"><label htmlFor={settingKey} className="block text-sm font-medium text-graphite-700">{label}</label><div className="mt-2 flex gap-2"><input id={settingKey} type="number" value={local} onChange={(e) => setLocal(e.target.value)} className="w-full rounded-[7px] border border-graphite-200 px-3 py-2 text-sm font-mono outline-none focus:border-ember-600"/><button onClick={() => onSave(local)} disabled={saving} className="rounded-card bg-graphite-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{saving ? "…" : "Save"}</button></div></div>;
}
