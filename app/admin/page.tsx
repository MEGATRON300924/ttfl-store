"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, Package, BarChart3, Wallet, Ticket, Megaphone, Layers, MessageCircle, Settings, FileText, Mail, ShoppingBag, Send, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";

const LINKS = [
  ["/admin/vendors", Users, "Vendor applications", "Approve, reject, or suspend vendors"],
  ["/admin/products", Package, "Product moderation", "Suspend or reinstate listings"],
  ["/admin/orders", ShoppingBag, "Orders & refunds", "View orders, issue Paystack refunds"],
  ["/admin/analytics", BarChart3, "Analytics", "Platform-wide stats and commission center"],
  ["/admin/plans", Layers, "Vendor plans", "Edit tier pricing, limits, commission"],
  ["/admin/categories", Layers, "Categories", "Create categories so vendors can list products"],
  ["/admin/settings", Settings, "Platform settings", "Featured pricing, minimum payout amount"],
  ["/admin/payouts", Wallet, "Payouts", "Review and approve vendor withdrawal requests"],
  ["/admin/coupons", Ticket, "Coupons", "Platform-wide discount codes"],
  ["/admin/featured", Megaphone, "Featured listings", "Active paid promotions"],
  ["/admin/broadcast", Send, "Broadcast center", "Send targeted popup and email announcements"],
  ["/admin/support", MessageCircle, "Support inbox", "Customer conversations"],
  ["/admin/audit-logs", FileText, "Audit logs", "Sensitive admin action history"],
  ["/admin/email-logs", Mail, "Email logs", "Delivery status for queued emails"],
] as const;

type AdminUser = { id: string; email: string; firstName: string; lastName: string; status: string; emailVerified: boolean; createdAt: string; lastLoginAt: string | null };

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  async function loadAdmins() {
    try {
      const result = await api.get<{ admins: AdminUser[] }>("/api/admin/admins");
      setAdmins(result.admins);
    } catch {
      setAdminError("Could not load administrators.");
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") void loadAdmins();
  }, [user]);

  async function addAdmin(event: React.FormEvent) {
    event.preventDefault();
    if (!adminEmail.trim()) return;
    setAdminLoading(true);
    setAdminMessage(null);
    setAdminError(null);
    try {
      const result = await api.post<{ admin: AdminUser }>("/api/admin/admins", { email: adminEmail.trim() });
      setAdmins((current) => current.some((item) => item.id === result.admin.id) ? current : [...current, result.admin]);
      setAdminEmail("");
      setAdminMessage(`${result.admin.email} is now an administrator.`);
    } catch (error) {
      setAdminError(error instanceof ApiError ? error.message : "Could not add administrator.");
    } finally {
      setAdminLoading(false);
    }
  }

  if (loading) return <div className="shell py-16 text-center"><p className="text-sm text-graphite-600">Loading...</p></div>;
  if (!user || user.role !== "ADMIN") return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900">Admin access only</h1></div>;

  return (
    <div className="shell py-8">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-xl font-bold text-graphite-900">Admin</h1><p className="mt-1 text-sm text-graphite-600">Manage TTFL Store from one place.</p></div>
        <Link href="/admin/broadcast" className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800"><Send className="h-4 w-4" /> Broadcast</Link>
      </div>

      <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><UserPlus className="h-5 w-5" /></span>
          <div><h2 className="font-bold text-graphite-900">Administrators</h2><p className="mt-0.5 text-sm text-graphite-600">Add another existing TTFL Store account as an admin using their email address.</p></div>
        </div>
        <form onSubmit={addAdmin} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="email" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="admin@example.com" className="min-w-0 flex-1 rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600" />
          <button disabled={adminLoading} className="inline-flex items-center justify-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"><UserPlus className="h-4 w-4" />{adminLoading ? "Adding..." : "Add admin"}</button>
        </form>
        {adminMessage && <p className="mt-3 rounded-card bg-verified-100 px-3 py-2 text-sm text-verified-700">{adminMessage}</p>}
        {adminError && <p className="mt-3 rounded-card bg-ember-100 px-3 py-2 text-sm text-ember-700">{adminError}</p>}
        <div className="mt-4 divide-y divide-graphite-200 border-t border-graphite-200">
          {admins.map((admin) => <div key={admin.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-graphite-900">{admin.firstName} {admin.lastName}</p><p className="text-xs text-graphite-600">{admin.email}</p></div><div className="flex items-center gap-2 text-xs text-graphite-600"><span className="rounded-[4px] bg-verified-100 px-2 py-1 font-semibold text-verified-700">Admin</span>{admin.emailVerified ? <span>Verified email</span> : <span>Unverified email</span>}</div></div>)}
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{LINKS.map(([href, Icon, title, desc]) => <Link key={href} href={href} className="flex items-center gap-4 rounded-card border border-graphite-200 p-5 hover:border-ember-600"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Icon className="h-5 w-5" /></span><div><p className="font-semibold text-graphite-900">{title}</p><p className="text-sm text-graphite-600">{desc}</p></div></Link>)}</div>
    </div>
  );
}
