"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

const ROLES = [
  ["MANAGER", "Manager", "Almost everything except payouts and ownership settings"],
  ["ORDERS", "Orders", "Orders, fulfilment and tracking"],
  ["PRODUCTS", "Products", "Create, edit and manage products"],
  ["SUPPORT", "Support", "Handle customer support"],
  ["FINANCE", "Finance", "View sales and earnings; payout account changes stay owner-only"],
] as const;

type Staff = { id: string; email: string; firstName: string; lastName: string; role: string; active: boolean; acceptedAt: string | null };

export default function TeamPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ORDERS");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() { try { const result = await api.get<{ items: Staff[] }>("/api/vendor-staff"); setStaff(result.items); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load team"); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);

  async function invite(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { await api.post("/api/vendor-staff/invite", { email, role }); setEmail(""); setMessage("Invitation sent."); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to send invitation"); } finally { setBusy(false); }
  }

  async function updateMember(id: string, data: { role?: string; active?: boolean }) { try { await api.patch(`/api/vendor-staff/${id}`, data); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update team member"); } }
  async function removeMember(id: string) { if (!window.confirm("Remove this team member from your store?")) return; try { await api.delete(`/api/vendor-staff/${id}`); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to remove team member"); } }

  return <div className="shell py-8">
    <div><h1 className="text-xl font-bold text-graphite-900">Team</h1><p className="mt-1 text-sm text-graphite-600">Invite trusted people to help run your store. Payout and ownership controls remain yours.</p></div>
    <form onSubmit={invite} className="mt-6 rounded-card border border-graphite-200 p-5"><h2 className="font-semibold text-graphite-900">Invite staff</h2><div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="staff@example.com" className="rounded-card border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-ember-600"/><select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-card border border-graphite-200 px-3 py-2 text-sm">{ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button disabled={busy} className="rounded-card bg-ember-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Sending…" : "Send invitation"}</button></div>{message && <p className="mt-3 text-sm text-graphite-600">{message}</p>}</form>
    <div className="mt-6 rounded-card border border-graphite-200"><div className="border-b border-graphite-200 px-5 py-4 font-semibold text-graphite-900">Current team</div>{loading ? <p className="p-5 text-sm text-graphite-600">Loading…</p> : staff.length === 0 ? <p className="p-5 text-sm text-graphite-600">No staff members yet.</p> : <div className="divide-y divide-graphite-200">{staff.map((member) => <div key={member.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_180px_140px_auto] md:items-center"><div><p className="font-medium text-graphite-900">{member.firstName || member.lastName ? `${member.firstName} ${member.lastName}`.trim() : member.email}</p><p className="text-xs text-graphite-600">{member.email} · {member.acceptedAt ? "Accepted" : "Invitation pending"}</p></div><select value={member.role} disabled={!member.active} onChange={(e) => void updateMember(member.id, { role: e.target.value })} className="rounded-card border border-graphite-200 px-3 py-2 text-sm">{ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button onClick={() => void updateMember(member.id, { active: !member.active })} className="rounded-card border border-graphite-200 px-3 py-2 text-sm">{member.active ? "Disable" : "Enable"}</button><button onClick={() => void removeMember(member.id)} className="text-left text-sm font-medium text-red-600">Remove</button></div>)}</div>}</div>
  </div>;
}
