"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import type { ApiSupportConversation } from "@/lib/api-types";

const TABS = ["OPEN", "ASSIGNED", "RESOLVED", "CLOSED"] as const;

type Report = ApiSupportConversation & { customer?: { firstName?: string; lastName?: string; email?: string } };

export default function AdminSupportPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("OPEN");
  const [conversations, setConversations] = useState<ApiSupportConversation[] | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [showReports, setShowReports] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  async function load(status: (typeof TABS)[number]) {
    setConversations(null);
    const { conversations } = await api.get<{ conversations: ApiSupportConversation[] }>(`/api/support/admin/conversations?status=${status}`);
    setConversations(conversations);
  }

  async function loadReports() {
    setReports(null);
    const { reports } = await api.get<{ reports: Report[] }>("/api/support/admin/reports");
    setReports(reports);
  }

  useEffect(() => { if (!showReports) void load(tab); }, [tab, showReports]);
  useEffect(() => { if (showReports) void loadReports(); }, [showReports]);

  return <div className="shell py-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold text-graphite-900">Support inbox</h1><p className="mt-1 text-sm text-graphite-600">Customer support conversations and reported marketplace problems.</p></div><button onClick={() => { setShowReports((value) => !value); setActiveId(null); }} className={`rounded-card px-4 py-2 text-sm font-semibold ${showReports ? "bg-ember-600 text-white" : "border border-graphite-200 bg-white text-graphite-800"}`}>{showReports ? "Back to inbox" : "Reported problems"}</button></div>
    {!showReports ? <><div className="mt-4 flex gap-1 border-b border-graphite-200">{TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === t ? "border-ember-600 text-ember-600" : "border-transparent text-graphite-600"}`}>{t}</button>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]"><aside className="flex flex-col gap-2">{conversations === null ? <p className="text-sm text-graphite-600">Loading…</p> : conversations.length === 0 ? <p className="text-sm text-graphite-600">Nothing here.</p> : conversations.map((c) => <button key={c.id} onClick={() => setActiveId(c.id)} className={`rounded-card border px-3 py-2 text-left text-sm ${activeId === c.id ? "border-ember-600 bg-ember-100" : "border-graphite-200"}`}><p className="font-medium text-graphite-900">{c.customer?.firstName} {c.customer?.lastName}</p><p className="truncate text-xs text-graphite-500">{c.messages[0]?.body}</p></button>)}</aside><div>{activeId ? <AdminConversationThread conversationId={activeId} onStatusChanged={() => load(tab)} /> : <p className="text-sm text-graphite-600">Select a conversation.</p>}</div></div></> : <div className="mt-6 grid gap-4">{reports === null ? <p className="text-sm text-graphite-600">Loading reported problems…</p> : reports.length === 0 ? <div className="rounded-card border border-graphite-200 bg-white p-6 text-sm text-graphite-600">No reported problems yet.</div> : reports.map((report) => <article key={report.id} className="rounded-card border border-graphite-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold text-graphite-900">{report.messages[0]?.body.split("\n")[0]?.replace(/^Subject:\s*/, "") || "Reported problem"}</h2><p className="mt-1 text-xs text-graphite-500">{report.customer?.firstName} {report.customer?.lastName} · {report.customer?.email}</p></div><span className="rounded-full bg-cloud-100 px-3 py-1 text-xs font-semibold text-graphite-700">{report.status}</span></div><pre className="mt-4 whitespace-pre-wrap rounded-[7px] bg-cloud-50 p-4 text-sm leading-6 text-graphite-700">{report.messages[0]?.body}</pre><button onClick={() => { setShowReports(false); setTab(report.status === "CLOSED" ? "CLOSED" : report.status === "RESOLVED" ? "RESOLVED" : report.status === "ASSIGNED" ? "ASSIGNED" : "OPEN"); setActiveId(report.id); }} className="mt-4 text-sm font-semibold text-ember-600">Open conversation →</button></article>)}</div>}
  </div>;
}

function AdminConversationThread({ conversationId, onStatusChanged }: { conversationId: string; onStatusChanged: () => void }) {
  const [conversation, setConversation] = useState<ApiSupportConversation | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  async function load() { const { conversation } = await api.get<{ conversation: ApiSupportConversation }>(`/api/support/conversations/${conversationId}`); setConversation(conversation); }
  useEffect(() => { void load(); pollRef.current = setInterval(() => void load(), 4000); return () => clearInterval(pollRef.current); }, [conversationId]);
  async function sendReply() { if (!reply.trim()) return; setSending(true); try { await api.post(`/api/support/conversations/${conversationId}/messages`, { body: reply }); await api.post(`/api/support/admin/conversations/${conversationId}/assign`); setReply(""); await load(); } finally { setSending(false); } }
  async function resolve() { await api.patch(`/api/support/admin/conversations/${conversationId}/status`, { status: "RESOLVED" }); onStatusChanged(); }
  if (!conversation) return <p className="text-sm text-graphite-600">Loading…</p>;
  return <div className="flex flex-col gap-3 rounded-card border border-graphite-200 p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-graphite-900">{conversation.customer?.firstName} {conversation.customer?.lastName} · {conversation.customer?.email}</p><button onClick={resolve} className="text-xs font-medium text-verified-600">Mark resolved</button></div><div className="flex max-h-96 flex-col gap-2 overflow-y-auto">{conversation.messages.map((m) => <div key={m.id} className={`max-w-[80%] rounded-card px-3 py-2 text-sm ${m.senderType === "AGENT" ? "self-end bg-graphite-900 text-white" : "self-start bg-cloud-100 text-graphite-900"}`}>{m.body}</div>)}</div><div className="flex gap-2"><input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void sendReply()} placeholder="Reply…" className="w-full rounded-[7px] border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-ember-600"/><button onClick={() => void sendReply()} disabled={sending} className="shrink-0 rounded-card bg-graphite-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Send</button></div></div>;
}
