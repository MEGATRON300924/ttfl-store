"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

const LABELS: Record<string, string> = {
  featured_homepage_price_per_day: "Homepage featured price (₦/day)",
  featured_trending_price_per_day: "Trending featured price (₦/day)",
  featured_category_price_per_day: "Category featured price (₦/day)",
  featured_search_price_per_day: "Search featured price (₦/day)",
  featured_store_price_per_day: "Featured store price (₦/day)",
  min_payout_amount: "Minimum payout amount (₦)",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function load() {
    const { settings } = await api.get<{ settings: Record<string, string> }>("/api/settings");
    setSettings(settings);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(key: string, value: string) {
    setSavingKey(key);
    try {
      await api.put(`/api/settings/${key}`, { value });
      await load();
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="shell max-w-xl py-8">
      <h1 className="text-xl font-bold text-graphite-900">Platform settings</h1>
      <p className="mt-1 text-sm text-graphite-600">Numbers that used to be hard-coded — now editable here.</p>

      {settings === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {Object.entries(settings).map(([key, value]) => (
            <SettingRow
              key={key}
              settingKey={key}
              label={LABELS[key] ?? key}
              value={value}
              saving={savingKey === key}
              onSave={(v) => save(key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SettingRow({
  settingKey,
  label,
  value,
  saving,
  onSave,
}: {
  settingKey: string;
  label: string;
  value: string;
  saving: boolean;
  onSave: (value: string) => void;
}) {
  const [local, setLocal] = useState(value);

  return (
    <div className="flex items-center justify-between gap-3 rounded-card border border-graphite-200 p-3">
      <label htmlFor={settingKey} className="text-sm text-graphite-700">
        {label}
      </label>
      <div className="flex shrink-0 items-center gap-2">
        <input
          id={settingKey}
          type="number"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          className="w-28 rounded-[7px] border border-graphite-200 px-2 py-1.5 text-sm font-mono"
        />
        <button
          onClick={() => onSave(local)}
          disabled={saving}
          className="rounded-card bg-graphite-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
        >
          {saving ? "…" : "Save"}
        </button>
      </div>
    </div>
  );
}
