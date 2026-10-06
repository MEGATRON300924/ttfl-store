"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, MessagesSquare } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const marketplaceOptions = [
  { value: "STORE", label: "TTFL Store Products", help: "Products, orders, payments or delivery." },
  { value: "CARS", label: "TTFL Cars", help: "Vehicles, dealers, inspections or listings." },
  { value: "HOMES", label: "TTFL Homes", help: "Properties, agents, inspections or listings." },
  { value: "ACCOUNT", label: "Account / website", help: "Login, account, website or other TTFL issue." },
] as const;

export default function ReportProblemPage() {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [marketplace, setMarketplace] = useState<(typeof marketplaceOptions)[number]["value"]>((searchParams.get("marketplace")?.toUpperCase() as any) || "STORE");
  const [subject, setSubject] = useState("");
  const [productId, setProductId] = useState("");
  const [listingName, setListingName] = useState(searchParams.get("listing") || "");
  const [listingUrl, setListingUrl] = useState(searchParams.get("url") || "");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorReferenceCode, setErrorReferenceCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const selected = marketplaceOptions.find((item) => item.value === marketplace)!;
      const context = [
        `TTFL support area: ${selected.label}`,
        listingName.trim() ? `Listing: ${listingName.trim()}` : "",
        listingUrl.trim() ? `Listing URL: ${listingUrl.trim()}` : "",
      ].filter(Boolean).join("\n");
      const text = `Support area: ${selected.label}\n${context ? context + "\n\n" : ""}${subject.trim() ? `Subject: ${subject.trim()}\n\n` : ""}${message.trim()}`;
      await api.post("/api/support/conversations", {
        message: text,
        marketplace,
        listingName: listingName.trim() || undefined,
        listingUrl: listingUrl.trim() || undefined,
        productId: marketplace === "STORE" ? productId.trim() || undefined : undefined,
        orderNumber: orderNumber.trim() || undefined,
        errorReferenceCode: errorReferenceCode.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't send your report.");
    } finally {
      setBusy(false);
    }
  }

  if (!loading && !user) {
    return <div className="shell py-16"><div className="mx-auto max-w-xl text-center"><AlertTriangle className="mx-auto h-8 w-8 text-ember-600"/><h1 className="mt-3 text-xl font-bold text-graphite-900">Log in to report a problem</h1><p className="mt-1 text-sm text-graphite-600">Your report opens a protected TTFL Support conversation.</p><Link href={`/login?next=${encodeURIComponent("/support/report")}`} className="mt-5 inline-flex rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white">Log in</Link></div></div>;
  }

  if (done) return <div className="shell py-16"><div className="mx-auto max-w-xl rounded-card border border-verified-100 bg-verified-100 p-7 text-center"><CheckCircle2 className="mx-auto h-9 w-9 text-verified-700"/><h1 className="mt-3 text-xl font-bold text-graphite-900">Report sent</h1><p className="mt-2 text-sm leading-6 text-graphite-700">Your report has been sent to TTFL Support. You can check responses and reply from your reports page.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Link href="/support/reports" className="inline-flex items-center gap-2 rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white"><MessagesSquare className="h-4 w-4"/>View my reports</Link><Link href="/support" className="inline-flex rounded-card bg-graphite-900 px-5 py-2.5 text-sm font-semibold text-white">Help centre</Link></div></div></div>;

  return <div className="shell py-8 sm:py-10"><div className="mx-auto max-w-2xl">
    <Link href="/support" className="inline-flex items-center gap-1 text-xs font-semibold text-graphite-600 hover:text-ember-600"><ArrowLeft className="h-3.5 w-3.5"/>Help centre</Link>
    <div className="mt-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL Support</p><h1 className="mt-2 text-3xl font-bold text-graphite-900">Report a problem</h1><p className="mt-2 text-sm leading-6 text-graphite-600">Tell us which TTFL marketplace the problem is about. Cars and Homes reports do not require a Product ID.</p></div>
    <form onSubmit={submit} className="mt-7 rounded-card border border-graphite-200 bg-white p-5"><div className="flex flex-col gap-4">
      <fieldset><legend className="mb-2 text-sm font-medium text-graphite-700">What are you reporting?</legend><div className="grid gap-2 sm:grid-cols-2">{marketplaceOptions.map((item)=><label key={item.value} className={`cursor-pointer rounded-card border p-3 ${marketplace===item.value?"border-ember-600 bg-ember-50":"border-graphite-200"}`}><input type="radio" name="marketplace" value={item.value} checked={marketplace===item.value} onChange={()=>setMarketplace(item.value)} className="sr-only"/><span className="block text-sm font-semibold text-graphite-900">{item.label}</span><span className="mt-1 block text-xs text-graphite-500">{item.help}</span></label>)}</div></fieldset>
      <label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Subject</span><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="What is the problem?" className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/></label>
      {marketplace==="STORE" && <label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Product ID <span className="font-normal text-graphite-400">(optional)</span></span><input value={productId} onChange={e=>setProductId(e.target.value)} placeholder="Only needed when reporting a TTFL Store product" className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/></label>}
      {(marketplace==="CARS" || marketplace==="HOMES") && <div className="rounded-[7px] bg-cloud-50 p-3 text-sm text-graphite-600"><strong className="text-graphite-900">{marketplace==="CARS"?"TTFL Cars":"TTFL Homes"} listing</strong><p className="mt-1 text-xs">No Product ID is required. Add the listing name or URL if you have it.</p></div>}
      {(marketplace==="CARS" || marketplace==="HOMES") && <><label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Listing name <span className="font-normal text-graphite-400">(optional)</span></span><input value={listingName} onChange={e=>setListingName(e.target.value)} placeholder={marketplace==="CARS"?"e.g. 2024 Toyota Camry":"e.g. 4 Bedroom Detached Duplex"} className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/></label><label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Listing URL <span className="font-normal text-graphite-400">(optional)</span></span><input value={listingUrl} onChange={e=>setListingUrl(e.target.value)} placeholder="Paste the listing link if available" className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/></label></>}
      <label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">Order number <span className="font-normal text-graphite-400">(optional)</span></span><input value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} placeholder="TTFL-2026-123456" className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/></label>
      <label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">TTFL error code <span className="font-normal text-graphite-400">(optional)</span></span><input value={errorReferenceCode} onChange={e=>setErrorReferenceCode(e.target.value)} placeholder="TTFL-ERR-..." className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/><p className="mt-1 text-xs text-graphite-500">If TTFL showed you an error code, include it so support can find the exact log.</p></label>
      <label className="text-sm"><span className="mb-1 block font-medium text-graphite-700">What happened?</span><textarea value={message} onChange={e=>setMessage(e.target.value)} required minLength={5} rows={7} placeholder="Describe the problem, what you expected, and what happened instead…" className="w-full rounded-[7px] border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/></label>
      {error&&<p role="alert" className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
      <button disabled={busy} className="rounded-card bg-ember-600 px-4 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">{busy?"Sending…":"Send report"}</button>
    </div></form>
  </div></div>;
}
