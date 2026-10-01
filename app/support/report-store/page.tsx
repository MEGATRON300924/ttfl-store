"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const reasons = [
  ["SCAM_FRAUD","Scam or fraud"],
  ["COUNTERFEIT","Counterfeit/fake products"],
  ["MISLEADING_LISTING","Misleading product or store information"],
  ["PAYMENT_OFF_PLATFORM","Suspicious/off-platform payment request"],
  ["NON_DELIVERY","Paid but did not receive the order"],
  ["HARASSMENT_ABUSE","Harassment or abusive behaviour"],
  ["SUSPICIOUS_ACTIVITY","Other suspicious activity"],
  ["OTHER","Other"],
] as const;

export default function ReportStorePage({ searchParams }: { searchParams: { vendorId?: string; store?: string } }) {
  const { user, loading } = useAuth();
  const [reason,setReason]=useState<(typeof reasons)[number][0]>("SCAM_FRAUD");
  const [description,setDescription]=useState("");
  const [evidence,setEvidence]=useState("");
  const [orderNumber,setOrderNumber]=useState("");
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const evidenceLinks=evidence.split(/\s+/).map(v=>v.trim()).filter(Boolean);
    try {
      if(!searchParams.vendorId) throw new Error("This store could not be identified.");
      await api.post("/api/store-reports",{vendorId:searchParams.vendorId,reason,description,evidenceLinks,orderNumber:orderNumber.trim()||undefined});
      setDone(true);
    } catch(err) { setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "We couldn't submit your report."); }
    finally { setBusy(false); }
  }

  if(loading) return <div className="shell py-16 text-center text-sm text-graphite-600">Loading…</div>;
  if(!user) return <div className="shell py-16 text-center"><ShieldAlert className="mx-auto h-9 w-9 text-ember-600"/><h1 className="mt-3 text-xl font-bold">Log in to report a store</h1><Link href="/login?next=/support/report-store" className="mt-5 inline-flex rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white">Log in</Link></div>;
  if(done) return <div className="shell py-16"><div className="mx-auto max-w-xl rounded-card border border-verified-100 bg-verified-100 p-7 text-center"><CheckCircle2 className="mx-auto h-9 w-9 text-verified-700"/><h1 className="mt-3 text-xl font-bold text-graphite-900">Store report submitted</h1><p className="mt-2 text-sm leading-6 text-graphite-700">Thanks for helping keep TTFL Store safe. Our team will review the information and evidence you provided.</p><Link href="/support/reports" className="mt-5 inline-flex rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white">View my reports</Link></div></div>;

  return <div className="shell py-8 sm:py-10"><div className="mx-auto max-w-2xl">
    <Link href={searchParams.vendorId ? "/store/"+encodeURIComponent(searchParams.store||"") : "/support"} className="inline-flex items-center gap-1 text-xs font-semibold text-graphite-600 hover:text-ember-600"><ArrowLeft className="h-3.5 w-3.5"/>Back</Link>
    <div className="mt-4"><p className="text-xs font-bold uppercase tracking-[.18em] text-ember-600">TTFL Store Safety</p><h1 className="mt-2 text-3xl font-bold text-graphite-900">Report a store</h1><p className="mt-2 text-sm leading-6 text-graphite-600">If you believe a store is involved in a scam, fraud, counterfeit sales, misleading activity, or another serious issue, tell us what happened and provide evidence.</p></div>
    <form onSubmit={submit} className="mt-7 rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
      <div className="space-y-4">
        <label className="block text-sm"><span className="mb-1 block font-medium text-graphite-700">Reason</span><select value={reason} onChange={e=>setReason(e.target.value as typeof reason)} className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5">{reasons.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-graphite-700">What happened?</span><textarea required minLength={20} maxLength={5000} value={description} onChange={e=>setDescription(e.target.value)} rows={7} placeholder="Explain what happened, what the store promised, what you paid or were asked to pay, and why you believe the activity is suspicious." className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-graphite-700">Evidence links</span><textarea required rows={4} value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Paste screenshot, receipt, chat, payment proof, listing or other evidence links. Put each link on a new line." className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/><p className="mt-1 text-xs text-graphite-500">Please only submit evidence relevant to this report. Do not share passwords or sensitive account credentials.</p></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-graphite-700">Order number <span className="font-normal text-graphite-400">(optional)</span></span><input value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} placeholder="TTFL-2026-123456" className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5"/></label>
        {error&&<p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
        <div className="rounded-[7px] bg-cloud-50 p-3 text-xs leading-5 text-graphite-600"><AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-ember-600"/>Submitting a report does not automatically mean the store is guilty. TTFL will review the evidence before taking action.</div>
        <button disabled={busy} className="w-full rounded-card bg-ember-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy?"Submitting…":"Submit store report"}</button>
      </div>
    </form>
  </div></div>;
}
