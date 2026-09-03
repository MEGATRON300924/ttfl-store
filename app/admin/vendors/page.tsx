"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Building2, Crown, Gem, ExternalLink } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { VendorStatus } from "@/lib/api-types";
import { StoreBadges, type StoreBadge } from "@/components/store-badges";

type Application = {
  id: string; storeName: string; storeSlug: string; status: VendorStatus; tier: string; appliedAt: string;
  verified: boolean; badges?: StoreBadge[]; user: { firstName: string; lastName: string; email: string };
};

const TABS: { label: string; value: VendorStatus }[] = [
  { label: "Pending", value: "PENDING" }, { label: "Approved", value: "APPROVED" }, { label: "Rejected", value: "REJECTED" }, { label: "Suspended", value: "SUSPENDED" },
];
const BADGES: { value: StoreBadge; label: string; icon: typeof BadgeCheck }[] = [
  { value: "VERIFIED", label: "Verified Store", icon: BadgeCheck }, { value: "BUSINESS", label: "Business Store", icon: Building2 }, { value: "ENTERPRISE", label: "Enterprise Store", icon: Building2 }, { value: "PLATINUM", label: "Platinum", icon: Crown },
];

export default function AdminVendorsPage() {
  const [tab, setTab] = useState<VendorStatus>("PENDING");
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(status: VendorStatus) {
    setApplications(null);
    try {
      const { applications } = await api.get<{ applications: Application[] }>(`/api/vendors/admin/applications?status=${status}`);
      const { stores } = await api.get<{ stores: Application[] }>("/api/store-profile/admin");
      const badgesById = new Map(stores.map((store) => [store.id, store.badges ?? []]));
      setApplications(applications.map((app) => ({ ...app, badges: badgesById.get(app.id) ?? (app.verified ? ["VERIFIED"] : []) })));
    } catch (err) { setApplications([]); }
  }

  useEffect(() => { void load(tab); }, [tab]);

  async function approve(id: string) { setBusyId(id); try { await api.post(`/api/vendors/admin/${id}/approve`); await load(tab); } finally { setBusyId(null); } }
  async function reject(id: string) { const reason = prompt("Reason for rejection?"); if (!reason) return; setBusyId(id); try { await api.post(`/api/vendors/admin/${id}/reject`, { reason }); await load(tab); } finally { setBusyId(null); } }
  async function suspend(id: string) { if (!confirm("Suspend this vendor? Their store and products go offline.")) return; setBusyId(id); try { await api.post(`/api/vendors/admin/${id}/suspend`); await load(tab); } finally { setBusyId(null); } }

  async function toggleBadge(id: string, badge: StoreBadge, enabled: boolean) {
    setBusyId(`${id}:${badge}`);
    try { await api.post(`/api/store-profile/admin/${id}/badge`, { badge, enabled }); await load(tab); }
    catch (err) { alert(err instanceof ApiError ? err.message : "Unable to update badge."); }
    finally { setBusyId(null); }
  }

  return (
    <div className="shell py-8">
      <div><h1 className="text-xl font-bold text-graphite-900">Vendor applications & store badges</h1><p className="mt-1 text-sm text-graphite-600">Approve stores, manage tiers, and control public trust badges.</p></div>
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-graphite-200">{TABS.map((t) => <button key={t.value} onClick={() => setTab(t.value)} className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === t.value ? "border-ember-600 text-ember-600" : "border-transparent text-graphite-600"}`}>{t.label}</button>)}</div>

      {applications === null ? <p className="mt-6 text-sm text-graphite-600">Loading…</p> : applications.length === 0 ? <div className="mt-6 rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">Nothing here.</div> : <div className="mt-6 flex flex-col gap-4">{applications.map((app) => {
        const badges = app.badges ?? [];
        return <div key={app.id} className="rounded-card border border-graphite-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><div className="flex items-center gap-2"><p className="font-semibold text-graphite-900">{app.storeName}</p>{app.verified && <BadgeCheck className="h-4 w-4 text-verified-600" />}</div><p className="text-sm text-graphite-600">{app.user.firstName} {app.user.lastName} · {app.user.email}</p><p className="text-xs text-graphite-400">Applied {new Date(app.appliedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} · {app.tier} tier</p></div>
            <a href={`/store/${app.storeSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-graphite-600 hover:text-ember-600">View store <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>

          {app.status === "APPROVED" && <div className="mt-5 border-t border-graphite-100 pt-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-graphite-900">Public badges</p><p className="text-xs text-graphite-500">Badges are controlled by TTFL Store administration.</p></div><StoreBadges badges={badges} /></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{BADGES.map(({ value, label, icon: Icon }) => { const enabled = badges.includes(value); const busy = busyId === `${app.id}:${value}`; return <button key={value} onClick={() => void toggleBadge(app.id, value, !enabled)} disabled={busy} className={`flex items-center justify-between rounded-card border px-3 py-3 text-left text-sm transition ${enabled ? "border-verified-100 bg-verified-100" : "border-graphite-200 hover:border-ember-600"}`}><span className="flex items-center gap-2 font-semibold text-graphite-800"><Icon className="h-4 w-4" />{label}</span><span className={`text-xs font-semibold ${enabled ? "text-verified-700" : "text-graphite-400"}`}>{busy ? "…" : enabled ? "Enabled" : "Grant"}</span></button>; })}</div></div>}

          <div className="mt-4 flex flex-wrap gap-2">{app.status === "PENDING" && <><button onClick={() => void approve(app.id)} disabled={busyId === app.id} className="rounded-card bg-verified-600 px-3 py-2 text-sm font-semibold text-white hover:bg-verified-700 disabled:opacity-60">Approve</button><button onClick={() => void reject(app.id)} disabled={busyId === app.id} className="rounded-card border border-graphite-300 px-3 py-2 text-sm font-semibold text-graphite-900 hover:bg-cloud-100 disabled:opacity-60">Reject</button></>}{app.status === "APPROVED" && <button onClick={() => void suspend(app.id)} disabled={busyId === app.id} className="rounded-card border border-ember-600 px-3 py-2 text-sm font-semibold text-ember-600 hover:bg-ember-100 disabled:opacity-60">Suspend</button>}</div>
        </div>;
      })}</div>}
    </div>
  );
}
