"use client";

import { FormEvent, useEffect, useState } from "react";
import { Send, Megaphone } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export default function BroadcastPage() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState("ALL");
  const [days, setDays] = useState("7");
  const [popup, setPopup] = useState(true);
  const [email, setEmail] = useState(false);
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  async function load() {
    try { const result = await api.get<{ items: any[] }>("/api/broadcast/admin"); setHistory(result.items); } catch {}
  }
  useEffect(() => { if (user?.role === "ADMIN") void load(); }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setStatus("Sending...");
    try {
      const result = await api.post<{ recipientCount: number }>("/api/broadcast/admin", { title, message, emailSubject: subject || undefined, sendPopup: popup, sendEmail: email, audience: { mode, days: Number(days) } });
      setStatus(`Broadcast created for ${result.recipientCount} users.`); setTitle(""); setMessage(""); setSubject(""); await load();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Broadcast failed"); }
  }

  if (loading) return <div className="shell py-16 text-center">Loading...</div>;
  if (!user || user.role !== "ADMIN") return <div className="shell py-16 text-center"><h1 className="font-bold">Admin access only</h1></div>;

  return <div className="shell py-8"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-card bg-ember-100 text-ember-700"><Megaphone className="h-5 w-5" /></span><div><h1 className="text-xl font-bold">Broadcast Center</h1><p className="text-sm text-graphite-600">Target users with popup announcements and Resend email.</p></div></div>
    <form onSubmit={submit} className="mt-6 max-w-3xl space-y-5 rounded-card border border-graphite-200 p-6">
      <div><label className="text-sm font-semibold">Title</label><input value={title} onChange={e => setTitle(e.target.value)} required maxLength={160} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" /></div>
      <div><label className="text-sm font-semibold">Message</label><textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6} maxLength={10000} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" /></div>
      <div><label className="text-sm font-semibold">Audience</label><select value={mode} onChange={e => setMode(e.target.value)} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5"><option value="ALL">All active users</option><option value="NEW">New users</option><option value="EXISTING">Existing users</option><option value="VERIFIED">Verified email users</option><option value="UNVERIFIED">Unverified email users</option><option value="VENDORS">Vendors</option><option value="CUSTOMERS">Customers</option></select></div>
      {(mode === "NEW" || mode === "EXISTING") && <div><label className="text-sm font-semibold">Age window in days</label><input type="number" min="1" max="3650" value={days} onChange={e => setDays(e.target.value)} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" /></div>}
      <div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 rounded-card border border-graphite-200 p-3"><input type="checkbox" checked={popup} onChange={e => setPopup(e.target.checked)} /> Popup notification</label><label className="flex items-center gap-2 rounded-card border border-graphite-200 p-3"><input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} /> Email via Resend</label></div>
      {email && <div><label className="text-sm font-semibold">Email subject</label><input value={subject} onChange={e => setSubject(e.target.value)} required={email} maxLength={200} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" /></div>}
      <button type="submit" className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-5 py-2.5 text-sm font-semibold text-white"><Send className="h-4 w-4" /> Send broadcast</button>
      {status && <p className="text-sm text-graphite-600">{status}</p>}
    </form>
    <section className="mt-8"><h2 className="font-bold">Recent broadcasts</h2><div className="mt-3 space-y-2">{history.map(item => <div key={item.id} className="rounded-card border border-graphite-200 p-4"><div className="flex justify-between gap-4"><strong>{item.title}</strong><span className="text-xs text-graphite-500">{new Date(item.createdAt).toLocaleString()}</span></div><p className="mt-1 text-sm text-graphite-600">{item.recipientCount} recipients · {item.sendPopup ? "Popup" : ""}{item.sendPopup && item.sendEmail ? " + " : ""}{item.sendEmail ? "Email" : ""}</p></div>)}</div></section>
  </div>;
}
