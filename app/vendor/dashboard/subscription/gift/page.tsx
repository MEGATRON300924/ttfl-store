"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gift, CheckCircle2, CalendarClock, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiSubscription } from "@/lib/api-types";
function formatDate(value: string | null) { return value ? new Date(value).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "short" }) : "Lifetime access"; }
export default function GiftedPlanPage() {
 const [subscription,setSubscription]=useState<ApiSubscription|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState<string|null>(null);
 useEffect(()=>{api.get<{subscription:ApiSubscription|null}>("/api/subscriptions/me").then(({subscription})=>setSubscription(subscription)).catch(err=>setError(err instanceof ApiError?err.message:"Couldn't load your gifted plan.")).finally(()=>setLoading(false));},[]);
 const gifted=Boolean(subscription?.isGifted&&subscription.plan.tier!=="FREE");
 const endedGift=Boolean(subscription&&subscription.status==="EXPIRED"&&subscription.plan.tier!=="FREE"&&subscription.renewalDate);
 if(loading)return <main className="shell py-12 text-sm text-graphite-500">Loading your gift confirmation…</main>;
 return <main className="shell min-h-[70vh] py-10">
 <Link href="/vendor/dashboard/subscription" className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-600"><ArrowLeft className="h-4 w-4"/> Subscription plans</Link>
 {error?<div className="mt-6 max-w-2xl rounded-card border border-ember-200 bg-ember-50 p-5 text-sm text-ember-700">{error}</div>:gifted||endedGift?<section className="mt-6 max-w-2xl overflow-hidden rounded-card border border-graphite-200 bg-white">
 <div className="border-b border-graphite-100 bg-cloud-50 p-6"><div className="flex h-11 w-11 items-center justify-center rounded-card bg-ember-100 text-ember-700"><Gift className="h-5 w-5"/></div><p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-ember-700">Complimentary plan</p><h1 className="mt-2 text-2xl font-bold text-graphite-900">{gifted?"You've been gifted a plan":"Your gifted access has ended"}</h1><p className="mt-2 text-sm leading-6 text-graphite-600">The Tron Forge Limited has {gifted?"granted your store":"previously granted your store"} complimentary access to the {subscription!.plan.name} plan.</p></div>
 <div className="grid gap-3 p-6 sm:grid-cols-2"><div className="rounded-card bg-cloud-50 p-4"><p className="text-xs text-graphite-500">Gifted plan</p><p className="mt-1 text-lg font-bold text-graphite-900">{subscription!.plan.name}</p></div><div className="rounded-card bg-cloud-50 p-4"><p className="flex items-center gap-1 text-xs text-graphite-500"><CalendarClock className="h-3.5 w-3.5"/>{gifted?"Access expires":"Expired on"}</p><p className="mt-1 text-sm font-semibold text-graphite-900">{formatDate(subscription!.renewalDate)}</p></div></div>
 {gifted&&subscription!.plan.features?.length?<div className="px-6 pb-5"><p className="text-sm font-semibold text-graphite-900">Included with your gift</p><ul className="mt-3 grid gap-2 sm:grid-cols-2">{subscription!.plan.features.map(feature=><li key={feature} className="flex gap-2 text-sm text-graphite-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-verified-600"/>{feature}</li>)}</ul></div>:null}
 <div className="border-t border-graphite-100 p-6"><p className="text-sm font-semibold text-graphite-900">To keep your plan</p><p className="mt-1 text-sm leading-6 text-graphite-600">Choose a paid subscription when you're ready to continue. Paystack collects your card details during subscription checkout and manages recurring billing. A separate payment-method-only setup is not currently available, and choosing a paid plan starts billing immediately.</p><Link href="/vendor/dashboard/subscription" className="mt-4 inline-flex rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white">View paid plans</Link></div>
 </section>:<section className="mt-6 max-w-2xl rounded-card border border-graphite-200 bg-white p-6"><h1 className="text-xl font-bold text-graphite-900">No gifted plan found</h1><p className="mt-2 text-sm text-graphite-600">This account does not currently have a gifted vendor plan.</p><Link href="/vendor/dashboard/subscription" className="mt-4 inline-flex text-sm font-semibold text-ember-700">View available plans →</Link></section>}
 </main>;
}