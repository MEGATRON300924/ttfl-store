"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, CircleAlert, ExternalLink, Flame, Save, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { BlackFridayDealsManager } from "@/components/admin/black-friday-deals-manager";
import { useAuth } from "@/lib/auth-context";

type BlackFridayConfig = {
  enabled: boolean;
  startsAt: string;
  endsAt: string;
  headline: string;
  subheadline: string;
  discountMode: "vendor" | "admin" | "vendor-approval";
  participation: "both" | "vendors" | "ttfl";
};

const defaults: BlackFridayConfig = {
  enabled: false,
  startsAt: "2026-11-26T23:00:00.000Z",
  endsAt: "2026-11-27T23:00:00.000Z",
  headline: "Black Friday at TTFL Store",
  subheadline: "Discover limited-time deals from Nigerian sellers.",
  discountMode: "vendor-approval",
  participation: "both",
};

function toLocalInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function toIso(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export default function BlackFridayAdminPage() {
  const { user, loading } = useAuth();
  const [config, setConfig] = useState<BlackFridayConfig>(defaults);
  const [startsAt, setStartsAt] = useState(toLocalInput(defaults.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(defaults.endsAt));
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !user || user.role !== "ADMIN") return;
    api.get<{ campaign: BlackFridayConfig }>("/api/settings/black-friday")
      .then(({ campaign }) => {
        setConfig(campaign);
        setStartsAt(toLocalInput(campaign.startsAt));
        setEndsAt(toLocalInput(campaign.endsAt));
      })
      .catch((reason) => setError(reason instanceof ApiError ? reason.message : "Could not load Black Friday settings."))
      .finally(() => setLoadingConfig(false));
  }, [loading, user]);

  function update<K extends keyof BlackFridayConfig>(key: K, value: BlackFridayConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const payload = { ...config, startsAt: toIso(startsAt), endsAt: toIso(endsAt) };
    if (!payload.startsAt || !payload.endsAt || new Date(payload.endsAt) <= new Date(payload.startsAt)) {
      setError("Choose a valid end date and time after the start date and time.");
      setSaving(false);
      return;
    }
    try {
      const result = await api.put<{ campaign: BlackFridayConfig }>("/api/settings/black-friday", payload);
      setConfig(result.campaign);
      setStartsAt(toLocalInput(result.campaign.startsAt));
      setEndsAt(toLocalInput(result.campaign.endsAt));
      setMessage("Black Friday settings saved. The storefront will follow the campaign schedule.");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not save Black Friday settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || loadingConfig) return <div className="shell max-w-4xl py-10"><p className="text-sm text-graphite-600">Loading Black Friday controls…</p></div>;
  if (!user || user.role !== "ADMIN") return <div className="shell max-w-2xl py-10"><section className="rounded-card border border-graphite-200 bg-white p-6"><h1 className="font-bold text-graphite-900">Admin access required</h1><p className="mt-2 text-sm text-graphite-600">Only authorised TTFL Store administrators can manage campaign settings.</p><Link href="/" className="mt-4 inline-flex text-sm font-semibold text-ember-700">Return to store</Link></section></div>;

  const now = Date.now();
  const starts = new Date(toIso(startsAt)).getTime();
  const ends = new Date(toIso(endsAt)).getTime();
  const status = !config.enabled ? "Off" : now < starts ? "Scheduled" : now < ends ? "Live" : "Ended";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-cloud-50">
      <div className="border-b border-graphite-200 bg-white">
        <div className="shell py-5">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-graphite-600 hover:text-graphite-900"><ArrowLeft className="h-4 w-4" /> Admin dashboard</Link>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-graphite-950 text-ember-500"><Flame className="h-6 w-6" /></span>
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-700">Campaign control centre</p><h1 className="mt-1 text-2xl font-bold text-graphite-950">Black Friday Special</h1><p className="mt-1 max-w-xl text-sm leading-6 text-graphite-600">Control the campaign storefront, schedule, search metadata and promotional rules from one place.</p></div>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status === "Live" ? "bg-verified-100 text-verified-700" : status === "Scheduled" ? "bg-amber-100 text-amber-800" : "bg-cloud-100 text-graphite-700"}`}><span className="h-2 w-2 rounded-full bg-current" />{status}</span>
          </div>
        </div>
      </div>

      <div className="shell max-w-5xl py-7">
        <form onSubmit={save} className="space-y-5">
          <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-800"><Flame className="h-5 w-5" /></span>
                <div><h2 className="font-bold text-graphite-900">Black Friday Special</h2><p className="mt-1 max-w-xl text-sm leading-6 text-graphite-600">Turn the campaign on or off. When enabled, it becomes visible during the configured campaign window. Turning it off restores the regular storefront without deleting store data.</p></div>
              </div>
              <button type="button" role="switch" aria-checked={config.enabled} onClick={() => update("enabled", !config.enabled)} className={`inline-flex min-w-36 items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-bold transition ${config.enabled ? "bg-graphite-950 text-white" : "border border-graphite-300 bg-white text-graphite-700"}`}>
                {config.enabled ? <ToggleRight className="h-5 w-5 text-ember-500" /> : <ToggleLeft className="h-5 w-5" />}
                {config.enabled ? "Campaign enabled" : "Campaign disabled"}
              </button>
            </div>
            <div className="mt-5 rounded-card border border-graphite-200 bg-cloud-50 p-4">
              <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-verified-700" /><p className="text-xs leading-5 text-graphite-600">All accounts with the <strong>ADMIN</strong> role can manage this campaign. Every save is validated by the backend; campaign dates and discount rules do not rely on browser-only checks.</p></div>
            </div>
          </section>

          <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3"><CalendarClock className="h-5 w-5 text-ember-700" /><div><h2 className="font-bold text-graphite-900">Campaign schedule</h2><p className="mt-1 text-sm text-graphite-600">Set the dates in your local time zone. The storefront follows this schedule automatically.</p></div></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-graphite-700">Starts at<input type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-2 block w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" /></label>
              <label className="block text-sm font-medium text-graphite-700">Ends at<input type="datetime-local" required value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="mt-2 block w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" /></label>
            </div>
            <p className="mt-3 text-xs text-graphite-500">Black Friday 2026 falls on Friday, 27 November. The default campaign window is set for 27 November in Nigeria time (WAT). Adjust it if you want a different trading window.</p>
          </section>

          <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
            <h2 className="font-bold text-graphite-900">Storefront message and SEO copy</h2>
            <p className="mt-1 text-sm text-graphite-600">These fields are used by the campaign landing page, social previews and campaign search metadata.</p>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-graphite-700">Campaign headline<input required maxLength={100} value={config.headline} onChange={(event) => update("headline", event.target.value)} className="mt-2 block w-full rounded-card border border-graphite-200 px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" /></label>
              <label className="block text-sm font-medium text-graphite-700">Description<textarea required maxLength={220} rows={3} value={config.subheadline} onChange={(event) => update("subheadline", event.target.value)} className="mt-2 block w-full resize-y rounded-card border border-graphite-200 px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" /></label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><Link href="/black-friday" target="_blank" className="inline-flex items-center gap-2 rounded-card border border-graphite-200 px-3 py-2 text-sm font-semibold text-graphite-800 hover:bg-cloud-50">Preview campaign page <ExternalLink className="h-4 w-4" /></Link></div>
          </section>

          <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
            <h2 className="font-bold text-graphite-900">Promotion rules</h2>
            <p className="mt-1 text-sm text-graphite-600">Choose who participates and how promotional prices are managed.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <fieldset><legend className="text-sm font-semibold text-graphite-800">Discount management</legend><div className="mt-3 space-y-2">
                {[["vendor-approval", "Vendor proposes, admin approves", "Recommended for marketplace price integrity."], ["vendor", "Vendors manage their own sale prices", "Requires vendor-side campaign controls."], ["admin", "Admins set all campaign prices", "Central control for selected promotions."]].map(([value, title, description]) => <label key={value} className={`flex cursor-pointer gap-3 rounded-card border p-3 ${config.discountMode === value ? "border-ember-500 bg-ember-50" : "border-graphite-200"}`}><input type="radio" name="discountMode" checked={config.discountMode === value} onChange={() => update("discountMode", value as BlackFridayConfig["discountMode"])} className="mt-1 accent-orange-600" /><span><span className="block text-sm font-semibold text-graphite-900">{title}</span><span className="mt-1 block text-xs leading-5 text-graphite-600">{description}</span></span></label>)}
              </div></fieldset>
              <fieldset><legend className="text-sm font-semibold text-graphite-800">Campaign participation</legend><div className="mt-3 space-y-2">
                {[["both", "Marketplace + TTFL featured deals", "All eligible vendors and TTFL Store promotions."], ["vendors", "Marketplace vendors only", "Include eligible vendor listings."], ["ttfl", "TTFL featured deals only", "Only TTFL-managed featured promotions."]].map(([value, title, description]) => <label key={value} className={`flex cursor-pointer gap-3 rounded-card border p-3 ${config.participation === value ? "border-ember-500 bg-ember-50" : "border-graphite-200"}`}><input type="radio" name="participation" checked={config.participation === value} onChange={() => update("participation", value as BlackFridayConfig["participation"])} className="mt-1 accent-orange-600" /><span><span className="block text-sm font-semibold text-graphite-900">{title}</span><span className="mt-1 block text-xs leading-5 text-graphite-600">{description}</span></span></label>)}
              </div></fieldset>
            </div>
          </section>

          {message && <p role="status" className="flex items-start gap-2 rounded-card border border-verified-200 bg-verified-50 p-3 text-sm text-verified-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>}
          {error && <p role="alert" className="flex items-start gap-2 rounded-card border border-ember-200 bg-ember-50 p-3 text-sm text-ember-700"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-graphite-500">Saving settings does not change product prices by itself. Promotional pricing controls will be connected to the existing product and flash-deal flows.</p><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-card bg-graphite-950 px-5 py-3 text-sm font-bold text-white hover:bg-graphite-800 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Saving campaign…" : "Save campaign settings"}</button></div>
        </form>
        <div className="mt-5"><BlackFridayDealsManager campaign={{ startsAt: config.startsAt, endsAt: config.endsAt }} /></div>
      </div>
    </div>
  );
}
