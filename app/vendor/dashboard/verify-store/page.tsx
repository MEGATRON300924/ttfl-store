"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { BadgeCheck, Building2, FileCheck2, FileText, ShieldCheck, UploadCloud } from "lucide-react";

type DocType = "GOVERNMENT_ID" | "BUSINESS_REGISTRATION" | "PROOF_OF_ADDRESS" | "TAX_DOCUMENT" | "OTHER";
type Verification = {
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  legalEntityType: "INDIVIDUAL" | "REGISTERED_BUSINESS" | "LIMITED_COMPANY";
  legalName: string; registrationNumber?: string|null; country: string; state?: string|null; city?: string|null;
  registeredAddress: string; representativeName: string; representativeRole?: string|null;
  contactEmail: string; contactPhone: string; taxId?: string|null; website?: string|null;
  documents: Array<{id:string;type:DocType;name:string;bytes:number;uploadedAt:string}>;
  rejectionReason?: string|null;
};
const empty: Omit<Verification,"status"|"documents"> & {declarationAccepted:boolean} = {
  legalEntityType:"INDIVIDUAL",legalName:"",registrationNumber:"",country:"Nigeria",state:"",city:"",
  registeredAddress:"",representativeName:"",representativeRole:"",contactEmail:"",contactPhone:"",
  taxId:"",website:"",declarationAccepted:false
};
const documentLabels:Record<DocType,string>={GOVERNMENT_ID:"Government-issued ID",BUSINESS_REGISTRATION:"Business registration certificate",PROOF_OF_ADDRESS:"Proof of business address",TAX_DOCUMENT:"Tax document",OTHER:"Other supporting document"};
const statusLabels:Record<string,string>={DRAFT:"Draft",SUBMITTED:"Submitted",UNDER_REVIEW:"Under review",APPROVED:"Approved",REJECTED:"Changes required"};

export default function VerifyStorePage(){
  const [form,setForm]=useState(empty);
  const [verification,setVerification]=useState<Verification|null>(null);
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[uploading,setUploading]=useState(false),[submitting,setSubmitting]=useState(false);
  const [docType,setDocType]=useState<DocType>("GOVERNMENT_ID");
  const [file,setFile]=useState<File|null>(null),[notice,setNotice]=useState(""),[error,setError]=useState("");
  async function load(){
    setLoading(true);setError("");
    try{
      const data=await api.get<{verification:Verification|null}>("/api/vendor-verification/me");
      setVerification(data.verification);
      if(data.verification) setForm({...empty,...data.verification,registrationNumber:data.verification.registrationNumber??"",state:data.verification.state??"",city:data.verification.city??"",representativeRole:data.verification.representativeRole??"",taxId:data.verification.taxId??"",website:data.verification.website??"",declarationAccepted:true});
    }catch(e){setError(e instanceof ApiError?e.message:"Unable to load verification details.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  function change<K extends keyof typeof empty>(key:K,value:(typeof empty)[K]){setForm(current=>({...current,[key]:value}));}
  async function save(){
    setSaving(true);setNotice("");setError("");
    try{
      const data=await api.put<{verification:Verification;message:string}>("/api/vendor-verification/me",{...form,website:form.website||null,registrationNumber:form.registrationNumber||null,state:form.state||null,city:form.city||null,representativeRole:form.representativeRole||null,taxId:form.taxId||null});
      setVerification(data.verification);setNotice(data.message);
    }catch(e){setError(e instanceof ApiError?e.message:"Unable to save legal information.");}
    finally{setSaving(false);}
  }
  async function upload(){
    if(!file)return;
    setUploading(true);setNotice("");setError("");
    try{
      const body=new FormData();body.append("document",file);body.append("type",docType);
      await api.post("/api/vendor-verification/me/documents",body);
      setFile(null);setNotice("Document uploaded securely.");await load();
    }catch(e){setError(e instanceof ApiError?e.message:"Document upload failed.");}
    finally{setUploading(false);}
  }
  async function submit(){
    setSubmitting(true);setNotice("");setError("");
    try{const result=await api.post<{message:string;verification:Verification}>("/api/vendor-verification/me/submit");setVerification(result.verification);setNotice(result.message);}
    catch(e){setError(e instanceof ApiError?e.message:"Unable to submit your verification.");}
    finally{setSubmitting(false);}
  }
  const locked=verification?.status==="APPROVED";
  if(loading)return <div className="shell py-12 text-sm text-graphite-500">Loading your verification profile…</div>;
  return <div className="shell max-w-4xl py-8">
    <div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ember-100 text-ember-700"><ShieldCheck size={22}/></div><div><h1 className="text-2xl font-bold text-graphite-950">Verify Store</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-graphite-600">Submit your legal business or identity information for review by TTFL Store / The Tron Forge Limited. Your documents are kept private and are only available to authorised reviewers.</p></div></div>
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-graphite-200 bg-white p-4">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-800"><BadgeCheck size={17}/> Verification status</span>
      <span className="rounded-full bg-cloud-100 px-3 py-1 text-xs font-bold text-graphite-700">{statusLabels[verification?.status??"DRAFT"]}</span>
      {verification?.status==="APPROVED"&&<span className="text-xs text-verified-700">Verified Store and Business Store badges have been awarded.</span>}
      {verification?.status==="REJECTED"&&verification.rejectionReason&&<p className="w-full text-sm text-ember-700">Reviewer feedback: {verification.rejectionReason}</p>}
    </div>
    {error&&<p role="alert" className="mt-4 rounded-lg bg-ember-50 p-3 text-sm text-ember-700">{error}</p>}
    {notice&&<p role="status" className="mt-4 rounded-lg bg-verified-50 p-3 text-sm text-verified-700">{notice}</p>}
    <section className="mt-6 rounded-xl border border-graphite-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2"><Building2 size={18}/><h2 className="font-bold text-graphite-900">Legal information</h2></div>
      <p className="mt-1 text-xs text-graphite-500">Use the exact details shown on your official documents.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-graphite-700">Legal entity type<select disabled={locked} value={form.legalEntityType} onChange={e=>change("legalEntityType",e.target.value as typeof form.legalEntityType)} className="mt-1.5 w-full rounded-lg border border-graphite-300 bg-white px-3 py-2.5 font-normal"><option value="INDIVIDUAL">Individual / Sole proprietor</option><option value="REGISTERED_BUSINESS">Registered business / Business name</option><option value="LIMITED_COMPANY">Limited liability company</option></select></label>
        <label className="text-sm font-semibold text-graphite-700">Legal name<input disabled={locked} value={form.legalName} onChange={e=>change("legalName",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal" placeholder="Name on your legal documents"/></label>
        {form.legalEntityType!=="INDIVIDUAL"&&<label className="text-sm font-semibold text-graphite-700">CAC / registration number<input disabled={locked} value={form.registrationNumber??""} onChange={e=>change("registrationNumber",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>}
        <label className="text-sm font-semibold text-graphite-700">Country<input disabled={locked} value={form.country} onChange={e=>change("country",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>
        <label className="text-sm font-semibold text-graphite-700">State<input disabled={locked} value={form.state??""} onChange={e=>change("state",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>
        <label className="text-sm font-semibold text-graphite-700">City<input disabled={locked} value={form.city??""} onChange={e=>change("city",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>
        <label className="text-sm font-semibold text-graphite-700 sm:col-span-2">Registered / business address<textarea disabled={locked} value={form.registeredAddress} onChange={e=>change("registeredAddress",e.target.value)} rows={2} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>
      </div>
    </section>
    <section className="mt-5 rounded-xl border border-graphite-200 bg-white p-5 sm:p-6">
      <h2 className="font-bold text-graphite-900">Authorised representative and contact</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-graphite-700">Representative full name<input disabled={locked} value={form.representativeName} onChange={e=>change("representativeName",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>
        <label className="text-sm font-semibold text-graphite-700">Position / role<input disabled={locked} value={form.representativeRole??""} onChange={e=>change("representativeRole",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal" placeholder="Owner, Director, Trustee…"/></label>
        <label className="text-sm font-semibold text-graphite-700">Contact email<input disabled={locked} type="email" value={form.contactEmail} onChange={e=>change("contactEmail",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>
        <label className="text-sm font-semibold text-graphite-700">Contact phone<input disabled={locked} value={form.contactPhone} onChange={e=>change("contactPhone",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>
        <label className="text-sm font-semibold text-graphite-700">Tax identification number (optional)<input disabled={locked} value={form.taxId??""} onChange={e=>change("taxId",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal"/></label>
        <label className="text-sm font-semibold text-graphite-700">Business website (optional)<input disabled={locked} value={form.website??""} onChange={e=>change("website",e.target.value)} className="mt-1.5 w-full rounded-lg border border-graphite-300 px-3 py-2.5 font-normal" placeholder="https://"/></label>
      </div>
      <label className="mt-5 flex items-start gap-2 text-sm text-graphite-700"><input disabled={locked} type="checkbox" checked={form.declarationAccepted} onChange={e=>change("declarationAccepted",e.target.checked)} className="mt-1"/>I confirm that the information and documents submitted are accurate, complete and belong to me or the business I represent.</label>
      {!locked&&<button onClick={()=>void save()} disabled={saving} className="mt-5 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?"Saving…":"Save legal information"}</button>}
    </section>
    <section className="mt-5 rounded-xl border border-graphite-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2"><FileCheck2 size={18}/><h2 className="font-bold text-graphite-900">Supporting documents</h2></div>
      <p className="mt-1 text-xs leading-5 text-graphite-500">Accepted formats: PDF, JPG, PNG and WebP. Maximum 10 MB per file. Upload the documents relevant to your legal entity type.</p>
      {verification?.documents?.length? <div className="mt-4 space-y-2">{verification.documents.map(doc=><div key={doc.id} className="flex items-center gap-3 rounded-lg border border-graphite-200 p-3"><FileText size={18} className="text-graphite-500"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-graphite-800">{doc.name}</p><p className="text-xs text-graphite-500">{documentLabels[doc.type]} · {(doc.bytes/1024/1024).toFixed(2)} MB</p></div></div>)}</div>:<p className="mt-4 text-sm text-graphite-500">No documents uploaded yet.</p>}
      {!locked&&<div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold text-graphite-700">Document type<select value={docType} onChange={e=>setDocType(e.target.value as DocType)} className="mt-1.5 w-full rounded-lg border border-graphite-300 bg-white px-3 py-2.5 font-normal">{Object.entries(documentLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-semibold text-graphite-700">Choose file<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]??null)} className="mt-1.5 block w-full text-xs font-normal"/></label>
        <button onClick={()=>void upload()} disabled={!file||uploading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-graphite-300 px-4 py-2.5 text-sm font-semibold text-graphite-800 disabled:opacity-40"><UploadCloud size={16}/>{uploading?"Uploading…":"Upload document"}</button>
      </div>}
    </section>
    {!locked&&<div className="mt-5 flex flex-col items-start gap-3 rounded-xl border border-ember-200 bg-ember-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-graphite-900">Ready for TTFL review?</p><p className="mt-1 text-xs leading-5 text-graphite-600">Save your details and upload at least one supporting document before submitting. Your store remains Registered until legal approval.</p></div><button onClick={()=>void submit()} disabled={submitting||!verification} className="shrink-0 rounded-lg bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{submitting?"Submitting…":"Submit for verification"}</button></div>}
  </div>;
}
