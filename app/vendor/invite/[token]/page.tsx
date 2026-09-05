"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export default function VendorInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { void api.get(`/api/vendor-staff/invitations/${params.token}`).then(setInvite).catch((error) => setMessage(error instanceof Error ? error.message : "This invitation is invalid or expired")); }, [params.token]);

  async function accept(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { const result = await api.post<{ requiresLogin: boolean }>(`/api/vendor-staff/invitations/${params.token}/accept`, { firstName, lastName, password }); if (result.requiresLogin) router.push(`/login?next=/vendor/dashboard`); else router.push("/vendor/dashboard"); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to accept invitation"); } finally { setBusy(false); }
  }

  if (!invite && !message) return <div className="shell py-20 text-center text-sm text-graphite-600">Loading invitation…</div>;
  return <div className="shell flex min-h-[70vh] items-center justify-center py-12"><div className="w-full max-w-lg rounded-card border border-graphite-200 p-6"><h1 className="text-xl font-bold text-graphite-900">Join {invite?.storeName ?? "this store"}</h1>{invite ? <><p className="mt-2 text-sm text-graphite-600">You were invited as <strong>{invite.role}</strong>. Your access will be limited to the permissions for this role.</p><p className="mt-1 text-xs text-graphite-500">Invitation for {invite.email}</p><form onSubmit={accept} className="mt-6 space-y-3"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="First name" className="w-full rounded-card border border-graphite-200 px-3 py-2 text-sm"/><input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Last name" className="w-full rounded-card border border-graphite-200 px-3 py-2 text-sm"/><input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} type="password" placeholder="Create password" className="w-full rounded-card border border-graphite-200 px-3 py-2 text-sm"/><button disabled={busy} className="w-full rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Accepting…" : "Accept invitation"}</button></form></> : <p className="mt-3 text-sm text-red-600">{message}</p>}{message && invite && <p className="mt-3 text-sm text-red-600">{message}</p>}</div></div>;
}
