"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const REFERRAL_CODE_KEY="ttfl_affiliate_ref";
const REFERRAL_TYPE_KEY="ttfl_affiliate_type";
const REFERRAL_SESSION_KEY="ttfl_affiliate_session";
const PENDING_CLAIM_KEY="ttfl_affiliate_pending_vendor_claim";

function getOrCreateAffiliateSession(){const existing=localStorage.getItem(REFERRAL_SESSION_KEY);if(existing&&existing.length>=8&&existing.length<=120)return existing;const sessionId=crypto.randomUUID();localStorage.setItem(REFERRAL_SESSION_KEY,sessionId);return sessionId;}

export function AffiliateTracker(){
  const router=useRouter();const {user}=useAuth();
  const [invite,setInvite]=useState<any>(null);const [claiming,setClaiming]=useState(false);const [saved,setSaved]=useState(false);
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);const ref=params.get("ref")?.trim().toUpperCase();if(!ref||ref.length<3)return;
    const type=params.get("type")?.trim().toUpperCase()==="VENDOR"?"VENDOR":"CUSTOMER";
    localStorage.setItem(REFERRAL_CODE_KEY,ref);localStorage.setItem(REFERRAL_TYPE_KEY,type);const sessionId=getOrCreateAffiliateSession();
    void api.post("/api/affiliates/click",{code:ref,sessionId,referralType:type,landingPath:window.location.pathname,source:document.referrer||undefined});
  },[]);
  useEffect(()=>{
    const code=localStorage.getItem(REFERRAL_CODE_KEY);const type=localStorage.getItem(REFERRAL_TYPE_KEY);const sessionId=getStoredAffiliateSession();
    if(!code||type!=="VENDOR"||!sessionId)return;
    void api.get<any>(`/api/affiliates/vendor-invite?code=${encodeURIComponent(code)}&sessionId=${encodeURIComponent(sessionId)}`).then(result=>{if(result.show)setInvite(result);}).catch(()=>undefined);
  },[user]);
  useEffect(()=>{
    const pending=localStorage.getItem(PENDING_CLAIM_KEY);if(!pending||!user)return;
    let data:{code:string;sessionId:string};try{data=JSON.parse(pending);}catch{return;}
    setClaiming(true);
    void api.post<any>("/api/affiliates/vendor-reward/claim",data).then(()=>{localStorage.removeItem(PENDING_CLAIM_KEY);setSaved(true);setInvite(null);}).catch(()=>undefined).finally(()=>setClaiming(false));
  },[user]);
  async function claim(){
    const code=localStorage.getItem(REFERRAL_CODE_KEY);const sessionId=getStoredAffiliateSession();if(!code||!sessionId)return;
    setClaiming(true);
    try{await api.post("/api/affiliates/vendor-reward/claim",{code,sessionId});setInvite(null);setSaved(true);}
    catch(err){if(err instanceof ApiError&&err.status===401){localStorage.setItem(PENDING_CLAIM_KEY,JSON.stringify({code,sessionId}));router.push(`/login?next=${encodeURIComponent(window.location.pathname+window.location.search)}`);}}
    finally{setClaiming(false);}
  }
  async function decline(){const code=localStorage.getItem(REFERRAL_CODE_KEY);const sessionId=getStoredAffiliateSession();if(!code||!sessionId)return;try{await api.post("/api/affiliates/vendor-reward/decline",{code,sessionId});}catch{}setInvite(null);}
  if(!invite&&!saved)return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-graphite-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="TTFL Store vendor invitation">
    <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-2xl">
      {saved?<div className="p-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verified-100 text-verified-700">✓</div><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-ember-600">Reward saved</p><h2 className="mt-2 text-2xl font-bold text-graphite-900">Your Pro Vendor reward is waiting</h2><p className="mt-3 text-sm leading-6 text-graphite-600">Your 1 month vendor plan has been saved to your TTFL Store account. You can apply it when your vendor profile is ready.</p><button onClick={()=>setSaved(false)} className="mt-6 w-full rounded-2xl bg-graphite-900 px-4 py-3 text-sm font-bold text-white">Continue</button></div>
      :<div className="p-7 text-center"><div className="text-sm font-bold text-graphite-900">✦ TTFL Store</div><h2 className="mt-7 text-2xl font-bold tracking-tight text-graphite-950">{invite.affiliate.displayName} invited you<br/>to TTFL Store</h2><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-graphite-600">You've been invited by an existing TTFL Store affiliate.</p><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-graphite-500">Your perk</p><div className="mx-auto mt-3 max-w-[210px] rounded-2xl border border-ember-200 bg-ember-50 px-5 py-4"><p className="text-lg font-bold text-graphite-900">⭐ {invite.perk.months} Month{invite.perk.months===1?"":"s"}</p><p className="text-sm font-semibold text-graphite-700">{invite.perk.tier} Vendor Plan</p></div><div className="mt-7 flex flex-col gap-2 sm:flex-row"><button disabled={claiming} onClick={claim} className="flex-1 rounded-2xl bg-ember-600 px-4 py-3 text-sm font-bold text-white hover:bg-ember-700 disabled:opacity-60">{claiming?"Saving…":"Claim Now"}</button><button disabled={claiming} onClick={decline} className="rounded-2xl border border-graphite-200 px-4 py-3 text-sm font-semibold text-graphite-700 hover:bg-cloud-100">Not Interested</button></div><p className="mt-4 text-[11px] leading-5 text-graphite-400">Claiming saves this reward to your account. It is not activated until you apply it to an approved vendor profile.</p></div>}
    </div>
  </div>;
}

export function getStoredAffiliateCode(){if(typeof window==="undefined")return undefined;return localStorage.getItem(REFERRAL_CODE_KEY)??undefined;}
export function getStoredAffiliateSession(){if(typeof window==="undefined")return undefined;const sessionId=localStorage.getItem(REFERRAL_SESSION_KEY);if(!sessionId||sessionId.length<8||sessionId.length>120)return undefined;return sessionId;}
export function getStoredAffiliateType(){if(typeof window==="undefined")return undefined;return localStorage.getItem(REFERRAL_TYPE_KEY)??undefined;}
