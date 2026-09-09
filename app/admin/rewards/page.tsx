"use client";

import { useEffect, useState } from "react";
import { Save, Settings2, Gift } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

const fields=[
  ["purchasePointsPer100","Purchase points per ₦100"],
  ["reviewPoints","Verified review points"],
  ["referralPoints","Referral points"],
  ["signupPoints","Welcome points"],
  ["profilePoints","Profile completion points"],
  ["expirationDays","Point expiration (days)"],
] as const;
export default function AdminRewardsPage(){const[values,setValues]=useState<Record<string,string>>({});const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);useEffect(()=>{void load();},[]);async function load(){try{const r=await api.get<{settings:{key:string;value:string}[]}>("/api/rewards/admin/settings");setValues(Object.fromEntries(r.settings.map(s=>[s.key,s.value])));}catch(e){setMessage(e instanceof ApiError?e.message:"Couldn't load reward settings");}}async function save(){setBusy(true);setMessage("");try{const body=Object.fromEntries(fields.map(([key])=>[key,Number(values[key]??0)]));await api.patch("/api/rewards/admin/settings",body);setMessage("Rewards settings saved.");}catch(e){setMessage(e instanceof ApiError?e.message:"Couldn't save settings");}finally{setBusy(false);}}return <div className="shell py-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">Admin</p><h1 className="mt-1 flex items-center gap-2 text-xl font-bold text-graphite-900 dark:text-white"><Gift className="h-5 w-5"/>TTFL Rewards</h1><p className="mt-2 text-sm text-graphite-600">Control how customers earn rewards without changing application code.</p></div><section className="mt-6 max-w-2xl rounded-card border border-graphite-200 p-5"><div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-ember-600"/><h2 className="font-bold text-graphite-900">Earning rules</h2></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map(([key,label])=><label key={key} className="text-sm font-medium text-graphite-800">{label}<input type="number" min="0" value={values[key]??""} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2"/></label>)}</div><button onClick={save} disabled={busy} className="mt-5 inline-flex items-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4"/>{busy?"Saving…":"Save settings"}</button>{message&&<p className="mt-3 text-sm text-graphite-700">{message}</p>}</section></div>}
