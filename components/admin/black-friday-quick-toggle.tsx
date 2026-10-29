"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, Flame, LoaderCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type Campaign = {
  enabled: boolean;
  startsAt: string;
  endsAt: string;
  headline: string;
  subheadline: string;
  discountMode: "vendor" | "admin" | "vendor-approval";
  participation: "both" | "vendors" | "ttfl";
};

export function BlackFridayQuickToggle() {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    api.get<{ campaign: Campaign }>("/api/settings/black-friday")
      .then((result) => setCampaign(result.campaign))
      .catch(() => setError("Campaign settings could not be loaded. Open campaign settings to retry."))
      .finally(() => setLoading(false));
  }, [user]);

  async function toggle() {
    if (!campaign || saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const result = await api.put<{ campaign: Campaign }>("/api/settings/black-friday", { ...campaign, enabled: !campaign.enabled });
      setCampaign(result.campaign);
      setMessage(result.campaign.enabled ? "Black Friday is enabled. It will go live during its scheduled window." : "Black Friday has been switched off.");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not update Black Friday.");
    } finally {
      setSaving(false);
    }
  }

  if (user?.role !== "ADMIN") return null;
  const live = Boolean(campaign?.enabled && Date.now() >= new Date(campaign.startsAt).getTime() && Date.now() < new Date(campaign.endsAt).getTime());

  return (
    <section className="mt-6 overflow-hidden rounded-card border border-graphite-800 bg-graphite-950 text-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-ember-600/15 text-ember-400"><Flame className="h-6 w-6" /></span>
          <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">Black Friday Special</h2><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${live ? "bg-verified-700 text-white" : campaign?.enabled ? "bg-amber-300 text-graphite-950" : "bg-white/10 text-graphite-300"}`}>{loading ? "Loading" : live ? "Live" : campaign?.enabled ? "Scheduled" : "Off"}</span></div><p className="mt-1 max-w-xl text-sm leading-6 text-graphite-300">One switch for the Black Friday campaign. Storefront messaging and campaign SEO follow the saved schedule.</p>{message && <p role="status" className="mt-2 flex items-start gap-1.5 text-xs text-emerald-300"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{message}</p>}{error && <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-rose-300"><CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>}</div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" role="switch" aria-checked={Boolean(campaign?.enabled)} onClick={() => void toggle()} disabled={loading || saving || !campaign} className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${campaign?.enabled ? "bg-ember-600 text-white" : "border border-white/20 bg-white/5 text-white hover:bg-white/10"}`}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : campaign?.enabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}{campaign?.enabled ? "Turn off" : "Turn on"}</button>
          <Link href="/admin/black-friday" aria-label="Open Black Friday settings" className="grid h-10 w-10 place-items-center rounded-card border border-white/20 text-white hover:bg-white/10"><ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
