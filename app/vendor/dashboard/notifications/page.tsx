"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";

type Preferences = {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  marketingEnabled: boolean;
};

const defaults: Preferences = { emailEnabled: true, whatsappEnabled: true, marketingEnabled: false };

export default function VendorNotificationsPage() {
  const { user, loading } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    void api.get<{ preferences: Preferences }>("/api/vendors/notification-preferences")
      .then((data) => setPreferences(data.preferences))
      .catch(() => setPreferences(defaults));
  }, [user]);

  async function toggle(field: keyof Preferences) {
    const next = !preferences[field];
    setPreferences((current) => ({ ...current, [field]: next }));
    setSaving(field);
    setMessage("");
    setError("");
    try {
      const data = await api.patch<{ preferences: Preferences }>("/api/vendors/notification-preferences", { [field]: next });
      setPreferences(data.preferences);
      setMessage("Notification preferences saved.");
    } catch (err) {
      setPreferences((current) => ({ ...current, [field]: !next }));
      setError(err instanceof ApiError ? err.message : "Unable to save your preferences.");
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="shell py-16 text-center text-sm text-graphite-600">Loading…</div>;
  if (!user || user.role !== "VENDOR") return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900">Vendor access only</h1></div>;

  const options: Array<{ key: keyof Preferences; title: string; description: string }> = [
    { key: "emailEnabled", title: "Email notifications", description: "Receive operational store notifications by email." },
    { key: "whatsappEnabled", title: "WhatsApp notifications", description: "Receive order and store alerts through WhatsApp." },
    { key: "marketingEnabled", title: "Marketing notifications", description: "Allow TTFL Store promotional and marketing messages." },
  ];

  return (
    <div className="shell py-8">
      <Link href="/vendor/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-600 hover:text-graphite-900"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
      <div className="mt-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Bell className="h-5 w-5" /></span><div><h1 className="text-2xl font-bold text-graphite-900">Notifications</h1><p className="mt-1 text-sm text-graphite-600">Choose how TTFL Store contacts you about your store.</p></div></div>
      {message && <div className="mt-6 flex items-center gap-2 rounded-card border border-verified-100 bg-verified-100 p-4 text-sm font-medium text-verified-700"><Check className="h-4 w-4" />{message}</div>}
      {error && <div className="mt-6 rounded-card border border-ember-100 bg-ember-100 p-4 text-sm font-medium text-ember-700">{error}</div>}
      <section className="mt-6 max-w-2xl rounded-card border border-graphite-200 bg-white divide-y divide-graphite-100">
        {options.map((option) => {
          const enabled = preferences[option.key];
          return <div key={option.key} className="flex items-center justify-between gap-5 p-5">
            <div><h2 className="font-semibold text-graphite-900">{option.title}</h2><p className="mt-1 text-sm text-graphite-600">{option.description}</p></div>
            <button type="button" disabled={saving === option.key} onClick={() => void toggle(option.key)} aria-pressed={enabled} className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-ember-600" : "bg-graphite-300"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`}>{saving === option.key && <Loader2 className="h-5 w-5 animate-spin p-1 text-graphite-500" />}</span>
            </button>
          </div>;
        })}
      </section>
    </div>
  );
}
