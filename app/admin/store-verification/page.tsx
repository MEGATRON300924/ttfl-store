"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { BadgeCheck, Building2, ExternalLink, FileText, ShieldCheck } from "lucide-react";

type Document = {id:string;type:string;name:string;mimeType:string;bytes:number;uploadedAt:string};
type Verification = {
  id:string;vendorId:string;status:string;legalEntityType:string;legalName:string;registrationNumber?:string|null;
  country:string;state?:string|null;city?:string|null;registeredAddress:string;representativeName:string;
  representativeRole?:string|null;contactEmail:string;contactPhone:string;taxId?:string|null;website?:string|null;
  documents:Document[];submittedAt?:string|null;storeName:string;storeSlug:string;ownerEmail:string;
  firstName:string;lastName:string;rejectionReason?:string|null;
};
const tabs=[["SUBMITTED","Pending review"],["APPROVED","Approved"],["REJECTED","Rejected"]] as const;
export default function StoreVerificationAdminPage(){
 const [tab,setTab]=useState<string>("SUBMITTED"),[items,setItems]=useState<Verification[]|null>(null),[busy,setBusy]=useState<string|null>(null),[notice,setNotice]=useState(""),[error,setError]=useState("");
 async function load(status=tab){setItems(null);setError("");try{const data=await api.get<{verifications:Verification[]}>(`/api/vendor-verification/admin?status=${status}`);setItems(data.verifications);}catch(e){setError(e instanceof ApiError?e.message:"Unable to load verification applications.");setItems([]);}}
 useEffect(()=>{void load(tab);},[tab]);
 async function openDocument(item:Verification,doc:Document){setBusy(doc.id);try{const result=await api.get<{url:string}>(`/api/vendor-verification/admin/${item.vendorId}/document/${doc.id}`);window.open(result.url,"_blank","noopener,noreferrer");}catch(e){alert(e instanceof ApiError?e.message:"Unable to open document.");}finally{setBusy(null);}}
 async function decide(item:Verification,decision:"APPROVE"|"REJECT"){const reason=decision==="REJECT"?prompt("Explain why this verification is being rejected:"):null;if(decision==="REJECT"&&!reason?.trim())return;if(!confirm(decision==="APPROVE"?`Approve legal verification for ${item.storeName}? This awards Verified Store and Business Store.`:`Reject legal verification for ${item.storeName}?`))return;setBusy(item.vendorId);setNotice("");try{const result=await api.post<{message:string}>(`/api/vendor-verification/admin/${item.vendorId}/decision`,{decision,reason});setNotice(result.message);await load(tab);}catch(e){setError(e instanceof ApiError?e.message:"Unable to record the decision.");}finally{setBusy(null);}}
 return <div className="shell py-8"><div className="flex items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-verified-100 text-verified-700"><ShieldCheck size={22}/></div><div><h1 className="text-2xl font-bold text-graphite-950">Store legal verification</h1><p className="mt-1 text-sm text-graphite-600">Review legal identity and business documents before awarding trust badges.</p></div></div>
 {notice&&<p className="mt-4 rounded-lg bg-verified-50 p-3 text-sm text-verified-700">{notice}</p>}{error&&<p role="alert" className="mt-4 rounded-lg bg-ember-50 p-3 text-sm text-ember-700">{error}</p>}
 <div className="mt-6 flex gap-1 overflow-x-auto border-b border-graphite-200">{tabs.map(([value,label])=><button key={value} onClick={()=>setTab(value)} className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold ${tab===value?"border-ember-600 text-ember-700":"border-transparent text-graphite-500"}`}>{label}</button>)}</div>
 {items===null?<p className="mt-6 text-sm text-graphite-500">Loading applications…</p>:items.length===0?<div className="mt-6 rounded-xl border border-dashed border-graphite-300 p-10 text-center text-sm text-graphite-500">No applications in this queue.</div>:<div className="mt-5 space-y-4">{items.map(item=><article key={item.id} className="rounded-xl border border-graphite-200 bg-white p-5">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="text-lg font-bold text-graphite-900">{item.storeName}</h2><span className="rounded-full bg-cloud-100 px-2.5 py-1 text-[11px] font-bold text-graphite-600">{item.status}</span></div><p className="mt-1 text-sm text-graphite-600">{item.firstName} {item.lastName} · {item.ownerEmail}</p><p className="mt-1 text-xs text-graphite-500">Submitted {item.submittedAt?new Date(item.submittedAt).toLocaleString("en-NG"):"—"}</p></div><a href={`https://ttflstore.name.ng/store/${item.storeSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-graphite-600">Public store <ExternalLink size={13}/></a></div>
  <div className="mt-4 grid gap-4 border-t border-graphite-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
   <div><p className="text-[11px] font-bold uppercase tracking-wide text-graphite-400">Legal entity</p><p className="mt-1 text-sm font-semibold text-graphite-800">{item.legalEntityType.replace(/_/g," ")}</p><p className="text-sm text-graphite-600">{item.legalName}</p></div>
   <div><p className="text-[11px] font-bold uppercase tracking-wide text-graphite-400">Registration number</p><p className="mt-1 text-sm text-graphite-800">{item.registrationNumber||"Not provided"}</p></div>
   <div><p className="text-[11px] font-bold uppercase tracking-wide text-graphite-400">Representative</p><p className="mt-1 text-sm text-graphite-800">{item.representativeName}{item.representativeRole?` · ${item.representativeRole}`:""}</p></div>
   <div><p className="text-[11px] font-bold uppercase tracking-wide text-graphite-400">Address</p><p className="mt-1 text-sm text-graphite-800">{[item.registeredAddress,item.city,item.state,item.country].filter(Boolean).join(", ")}</p></div>
   <div><p className="text-[11px] font-bold uppercase tracking-wide text-graphite-400">Contact</p><p className="mt-1 text-sm text-graphite-800">{item.contactEmail}</p><p className="text-sm text-graphite-600">{item.contactPhone}</p></div>
   <div><p className="text-[11px] font-bold uppercase tracking-wide text-graphite-400">Tax / website</p><p className="mt-1 text-sm text-graphite-800">{item.taxId||"No tax ID"}</p>{item.website&&<a className="text-xs text-ember-700 underline" href={item.website} target="_blank" rel="noreferrer">{item.website}</a>}</div>
  </div>
  <div className="mt-4 border-t border-graphite-100 pt-4"><p className="mb-2 text-sm font-bold text-graphite-800">Supporting documents ({item.documents?.length??0})</p><div className="flex flex-wrap gap-2">{(item.documents??[]).map(doc=><button key={doc.id} onClick={()=>void openDocument(item,doc)} disabled={busy===doc.id} className="inline-flex items-center gap-2 rounded-lg border border-graphite-200 px-3 py-2 text-left text-xs font-semibold text-graphite-700 hover:border-ember-400 disabled:opacity-50"><FileText size={15}/><span>{doc.name}</span><span className="text-graphite-400">{busy===doc.id?"Opening…":"View"}</span></button>)}</div></div>
  {["SUBMITTED","UNDER_REVIEW"].includes(item.status)&&<div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-graphite-100 pt-4"><button onClick={()=>void decide(item,"REJECT")} disabled={busy===item.vendorId} className="rounded-lg border border-ember-300 px-4 py-2.5 text-sm font-semibold text-ember-700 disabled:opacity-50">Reject</button><button onClick={()=>void decide(item,"APPROVE")} disabled={busy===item.vendorId} className="inline-flex items-center gap-2 rounded-lg bg-verified-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><BadgeCheck size={16}/>{busy===item.vendorId?"Saving…":"Approve legal verification"}</button></div>}
 </article>)}</div>}
 </div>;
}
