"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Check, Copy, ExternalLink, Link2, Loader2, Wallet } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { formatNaira } from "@/lib/mock-data";

type Dashboard = {
  affiliate: {
    code: string;
    status: string;
    commissionRate: number;
    clicks: number;
    conversions: number;
    pendingEarnings: number;
    paidEarnings: number;
  };
  commissions: Array<{
    id: string;
    orderNumber: string;
    orderAmount: number;
    amount: number;
    status: string;
    createdAt: string;
  }>;
};

export default function AffiliateDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<{ dashboard: Dashboard | null }>("/api/affiliates/dashboard");
      setDashboard(res.dashboard);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load your affiliate dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) void load();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const link = useMemo(() => dashboard ? `${window.location.origin}/?ref=${encodeURIComponent(dashboard.affiliate.code)}` : "", [dashboard]);

  async function join() {
    setJoining(true);
    setError(null);
    try {
      await api.post("/api/affiliates/join");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create your affiliate account.");
    } finally {
      setJoining(false);
    }
  }

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (authLoading || loading) return <div className="shell flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-graphite-400" /></div>;

  if (!user) return <div className="shell py-16 text-center"><h1 className="text-xl font-bold text-graphite-900">Log in to access your affiliate dashboard</h1><Link href="/login?next=/affiliate/dashboard" className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white">Log in</Link></div>;

  if (!dashboard) return (
    <div className="shell py-16">
      <div className="mx-auto max-w-2xl rounded-card border border-graphite-200 bg-white p-8 text-center">
        <Wallet className="mx-auto h-10 w-10 text-ember-600" />
        <h1 className="mt-4 text-2xl font-bold text-graphite-900">Become a TTFL Store affiliate</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-graphite-600">Create your affiliate account and get a unique referral link. You will earn commission on qualifying paid orders.</p>
        <button onClick={join} disabled={joining} className="mt-6 rounded-card bg-ember-600 px-5 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">{joining ? "Creating account…" : "Create affiliate account"}</button>
        {error && <p className="mt-3 text-sm text-ember-700">{error}</p>}
      </div>
    </div>
  );

  const a = dashboard.affiliate;
  const conversionRate = a.clicks ? ((a.conversions / a.clicks) * 100).toFixed(1) : "0.0";

  return (
    <div className="shell py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-wide text-ember-600">Affiliate dashboard</p><h1 className="mt-1 text-2xl font-bold text-graphite-900">Grow your referrals</h1><p className="mt-1 text-sm text-graphite-600">Your affiliate performance and commission history.</p></div>
        <Link href="/affiliate" className="text-sm font-semibold text-graphite-700 hover:text-ember-600">Program details →</Link>
      </div>

      <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Your referral link</p><div className="mt-2 flex min-w-0 items-center gap-2 rounded-[7px] border border-graphite-200 bg-cloud-100 px-3 py-2.5"><Link2 className="h-4 w-4 shrink-0 text-ember-600" /><span className="truncate font-mono text-xs text-graphite-700">{link}</span></div></div>
          <button onClick={copyLink} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy link"}</button>
          <a href={link} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-card border border-graphite-300 px-4 py-2.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100"><ExternalLink className="h-4 w-4" />Open</a>
        </div>
        <p className="mt-3 text-xs text-graphite-500">Code: <span className="font-mono font-semibold text-graphite-700">{a.code}</span> · {a.commissionRate}% commission · Status: <span className="font-semibold text-verified-700">{a.status}</span></p>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Wallet />} label="Pending earnings" value={formatNaira(a.pendingEarnings)} />
        <Stat icon={<Wallet />} label="Paid earnings" value={formatNaira(a.paidEarnings)} />
        <Stat icon={<BarChart3 />} label="Clicks" value={a.clicks.toLocaleString()} />
        <Stat icon={<BarChart3 />} label="Conversions" value={`${a.conversions.toLocaleString()} (${conversionRate}%)`} />
      </section>

      <section className="mt-8 rounded-card border border-graphite-200 bg-white">
        <div className="border-b border-graphite-200 p-5"><h2 className="text-sm font-bold text-graphite-900">Commission history</h2><p className="mt-1 text-xs text-graphite-500">Your latest 50 attributed paid orders.</p></div>
        {dashboard.commissions.length === 0 ? <div className="p-8 text-center text-sm text-graphite-500">No commissions yet. Share your referral link to get started.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-cloud-100 text-xs text-graphite-500"><tr><th className="px-5 py-3 font-semibold">Order</th><th className="px-5 py-3 font-semibold">Order value</th><th className="px-5 py-3 font-semibold">Commission</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Date</th></tr></thead><tbody className="divide-y divide-graphite-100">{dashboard.commissions.map((c) => <tr key={c.id}><td className="px-5 py-3 font-mono text-xs text-graphite-700">{c.orderNumber}</td><td className="px-5 py-3 text-graphite-700">{formatNaira(c.orderAmount)}</td><td className="px-5 py-3 font-semibold text-graphite-900">{formatNaira(c.amount)}</td><td className="px-5 py-3"><span className="rounded-[4px] bg-gold-100 px-2 py-1 text-xs font-semibold text-gold-600">{c.status}</span></td><td className="px-5 py-3 text-xs text-graphite-500">{new Date(c.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-card border border-graphite-200 bg-white p-5"><div className="text-ember-600">{icon}</div><p className="mt-3 text-xs font-medium text-graphite-500">{label}</p><p className="mt-1 text-lg font-bold text-graphite-900">{value}</p></div>;
}
