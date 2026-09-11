"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, Send, Clock3 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type Conversation={id:string;status:"OPEN"|"ASSIGNED"|"RESOLVED"|"CLOSED";orderNumber?:string|null;createdAt:string;updatedAt:string;messages:{id:string;senderType:"CUSTOMER"|"AGENT"|"SYSTEM";body:string;createdAt:string}[]};

export default function SupportReportsPage(){
  const {user,loading:authLoading}=useAuth();
  const [conversations,setConversations]=useState<Conversation[]>([]);
  const [selected,setSelected]=useState<string>("");
  const [detail,setDetail]=useState<Conversation|null>(null);
  const [reply,setReply]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  async function load(){
    try{
      setError("");
      const response=await api.get<{conversations:Conversation[]}>("/api/support/conversations/me");
      setConversations(response.conversations);
      if(!selected && response.conversations[0]) setSelected(response.conversations[0].id);
    }catch(e){setError(e instanceof ApiError?e.message:"Couldn't load your reports.");}
  }

  async function loadDetail(id:string){
    try{
      const response=await api.get<{conversation:Conversation}>(`/api/support/conversations/${encodeURIComponent(id)}`);
      setDetail(response.conversation);
    }catch(e){setError(e instanceof ApiError?e.message:"Couldn't load this report.");}
  }

  useEffect(()=>{if(user)void load();},[user]);
  useEffect(()=>{if(selected)void loadDetail(selected);},[selected]);

  async function sendReply(){
    if(!detail||!reply.trim())return;
    setBusy(true);setError("");
    try{
      await api.post(`/api/support/conversations/${encodeURIComponent(detail.id)}/messages`,{body:reply.trim()});
      setReply("");
      await loadDetail(detail.id);
      await load();
    }catch(e){setError(e instanceof ApiError?e.message:"Couldn't send your reply.");}
    finally{setBusy(false);}
  }

  if(authLoading)return <div className="shell py-16 text-center text-sm text-graphite-600">Loading support…</div>;
  if(!user)return <div className="shell py-16 text-center"><MessageCircle className="mx-auto h-9 w-9 text-ember-600"/><h1 className="mt-3 text-xl font-bold text-graphite-900">Log in to view your reports</h1><Link href="/login?next=/support/reports" className="mt-5 inline-flex rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white">Log in</Link></div>;

  return <div className="shell py-8 sm:py-10"><div className="mx-auto max-w-5xl">
    <Link href="/support" className="inline-flex items-center gap-1 text-xs font-semibold text-graphite-600 hover:text-ember-600"><ArrowLeft className="h-3.5 w-3.5"/>Help centre</Link>
    <div className="mt-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL support</p><h1 className="mt-2 text-3xl font-bold text-graphite-900">My reports</h1><p className="mt-2 text-sm text-graphite-600">Check every report you have submitted, read TTFL's responses, and reply from one place.</p></div>
    {error&&<p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
    <div className="mt-7 grid gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-card border border-graphite-200 bg-white p-3">
        {conversations.length===0?<div className="p-5 text-center text-sm text-graphite-600">No reports yet.<Link href="/support/report" className="mt-3 block font-semibold text-ember-600">Report a problem</Link></div>:<div className="space-y-2">{conversations.map((conversation)=><button key={conversation.id} type="button" onClick={()=>setSelected(conversation.id)} className={`w-full rounded-card border p-3 text-left ${selected===conversation.id?"border-ember-600 bg-ember-50":"border-graphite-200"}`}><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide text-ember-600">{conversation.status}</span><Clock3 className="h-3.5 w-3.5 text-graphite-400"/></div><p className="mt-1 line-clamp-2 text-sm font-semibold text-graphite-900">{conversation.messages[0]?.body.replace(/^Subject:\s*[^\n]+\n\n/,"")||"Support report"}</p><p className="mt-2 text-[11px] text-graphite-500">{new Date(conversation.createdAt).toLocaleDateString("en-NG",{dateStyle:"medium"})}{conversation.orderNumber?` · ${conversation.orderNumber}`:""}</p></button>)}</div>}
      </aside>
      <section className="rounded-card border border-graphite-200 bg-white p-4 sm:p-6">
        {!detail?<div className="flex min-h-80 items-center justify-center text-sm text-graphite-500">Select a report to see the full conversation.</div>:<>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-graphite-100 pb-4"><div><p className="text-xs font-bold uppercase tracking-wide text-ember-600">Report</p><h2 className="mt-1 text-lg font-bold text-graphite-900">{detail.orderNumber||"TTFL Store Support"}</h2></div><span className="rounded-full bg-cloud-100 px-3 py-1 text-xs font-bold text-graphite-700">{detail.status}</span></div>
          <div className="mt-5 space-y-4">{detail.messages.map(message=><div key={message.id} className={`flex ${message.senderType==="CUSTOMER"?"justify-end":"justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.senderType==="CUSTOMER"?"bg-ember-600 text-white":"bg-cloud-100 text-graphite-900"}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className={`mt-2 text-[10px] ${message.senderType==="CUSTOMER"?"text-white/70":"text-graphite-500"}`}>{message.senderType==="AGENT"?"TTFL Support":"You"} · {new Date(message.createdAt).toLocaleString("en-NG")}</p></div></div>)}</div>
          {detail.status!=="CLOSED"&&<div className="mt-5 border-t border-graphite-100 pt-4"><textarea value={reply} onChange={e=>setReply(e.target.value)} rows={4} placeholder="Reply to TTFL Support…" className="w-full rounded-card border border-graphite-200 px-3 py-2.5 outline-none focus:border-ember-600"/><button onClick={sendReply} disabled={busy||!reply.trim()} className="mt-3 inline-flex items-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4"/>{busy?"Sending…":"Send reply"}</button></div>}
          {detail.status==="RESOLVED"&&<div className="mt-4 flex items-center gap-2 rounded-card bg-verified-100 p-3 text-sm text-verified-800"><CheckCircle2 className="h-4 w-4"/>TTFL has marked this report resolved. You can still reply if the issue needs attention.</div>}
        </>}
      </section>
    </div>
  </div></div>;
}
