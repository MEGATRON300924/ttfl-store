"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type Report={id:string;reason:string;description:string;evidenceLinks:string[];orderNumber?:string|null;status:string;adminNotes?:string|null;createdAt:string;vendor:{id:string;storeName:string;storeSlug:string};reporter:{firstName:string;lastName:string;email:string}};
export default function AdminStoreReportsPage(){
 const {user,loading}=useAuth(); const [reports,setReports]=useState<Report[]>([]); const [status,setStatus]=useState(""); const [error,setError]=useState("");
 async function load(){try{const r=await api.get<{reports:Report[]}>("/api/store-reports/admin"+(status?"?status="+status:""));setReports(r.reports)}catch(e){setError(e instanceof ApiError?e.message:"Couldn't load store reports.")}}
 useEffect(()=>{if(user?.role==="ADMIN")void load()},[user,status]);
 async function update(id:string,next:string){try{await api.patch("/api/store-reports/admin/"+id,{status:next});await load()}catch(e){setError(e instanceof ApiError?e.message:"Couldn't update report.")}}
 if(loading)return <div className="shell py-16 text-center">Loading…</div>;
 if(user?.role!=="ADMIN")return <div className="shell py-16 text-center">Administrator access required.</div>;
 return <div className="shell py-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-ember-600">Safety</p><h1 className="mt-2 text-3xl font-bold">Store reports</h1><p className="mt-2 text-sm text-graphite-600">Review customer reports, evidence and store-safety concerns.</p></div><select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-card border border-graphite-200 bg-white px-3 py-2 text-sm"><option value="">All statuses</option><option>OPEN</option><option>UNDER_REVIEW</option><option>RESOLVED</option><option>DISMISSED</option></select></div>
 {error&&<p className="mt-4 rounded-card bg-ember-100 p-3 text-sm text-ember-700">{error}</p>}
 <div className="mt-6 space-y-4">{reports.map(r=><article key={r.id} className="rounded-card border border-graphite-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">{r.vendor.storeName}</h2><p className="text-xs text-graphite-500">{r.reporter.firstName} {r.reporter.lastName} · {r.reporter.email} · {new Date(r.createdAt).toLocaleString("en-NG")}</p></div><span className="rounded-full bg-cloud-100 px-3 py-1 text-xs font-bold">{r.status}</span></div><p className="mt-3 text-sm font-semibold">{r.reason.replaceAll("_"," ")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-graphite-700">{r.description}</p>{r.orderNumber&&<p className="mt-2 text-xs text-graphite-500">Order: {r.orderNumber}</p>}<div className="mt-4"><p className="text-xs font-bold uppercase tracking-wide text-graphite-500">Evidence</p><div className="mt-2 flex flex-wrap gap-2">{r.evidenceLinks.map((url,i)=><a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-full border border-graphite-200 px-3 py-1.5 text-xs font-semibold text-ember-700">Evidence {i+1} ↗</a>)}</div></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>update(r.id,"UNDER_REVIEW")} className="rounded-card bg-graphite-900 px-3 py-2 text-xs font-semibold text-white">Review</button><button onClick={()=>update(r.id,"RESOLVED")} className="rounded-card bg-verified-600 px-3 py-2 text-xs font-semibold text-white">Resolve</button><button onClick={()=>update(r.id,"DISMISSED")} className="rounded-card border border-graphite-200 px-3 py-2 text-xs font-semibold">Dismiss</button></div></article>)}</div>
 {!reports.length&&<div className="mt-8 rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-500">No store reports found.</div>}
 </div>
}
