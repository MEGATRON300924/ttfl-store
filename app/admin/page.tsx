"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, Package, BarChart3, Wallet, Ticket, Megaphone, Layers, MessageCircle, Settings, FileText, Mail, ShoppingBag, Send, UserPlus, MessageSquare, UserMinus, BellRing, CalendarDays, Gift, AlertTriangle, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";

type AdminUser = { id: string; email: string; firstName: string; lastName: string; status: string; emailVerified: boolean; createdAt: string; lastLoginAt: string | null };
const LINKS = [["/admin/events", CalendarDays, "Partner events", "Review partner events and manage event plans"],["/admin/vendors", Users, "Vendor applications", "Approve, reject, or suspend vendors"],["/admin/products", Package, "Product moderation", "Suspend or reinstate listings"],["/admin/orders", ShoppingBag, "Orders & refunds", "View orders, issue Paystack refunds"],["/admin/analytics", BarChart3, "Analytics", "Platform-wide stats and commission center"],["/admin/plans", Layers, "Vendor plans", "Edit tier pricing, limits, commission"],["/admin/categories", Layers, "Categories", "Create categories so vendors can list products"],["/admin/settings", Settings, "Platform settings", "Pricing, payouts and WhatsApp notification numbers"],["/admin/rewards", Gift, "TTFL Rewards", "Configure signup, purchase, review and referral points"],["/admin/payouts", Wallet, "Payouts", "Review and approve vendor withdrawal requests"],["/admin/coupons", Ticket, "Coupons", "Platform-wide discount codes"],["/admin/featured", Megaphone, "Featured listings", "Active paid promotions"],["/admin/waitlists", BellRing, "Coming Soon waitlists", "See customer demand for upcoming products"],["/admin/broadcast", Send, "Broadcast center", "Send targeted popup and email announcements"],["/admin/support", MessageCircle, "Support & reported problems", "Customer conversations and problem reports"],["/admin/audit-logs", FileText, "Audit logs", "Sensitive admin action history"],["/admin/error-logs", AlertTriangle, "Error logs", "Search customer error codes and investigate failures"],["/admin/email-settings", Mail, "Email configuration", "Check provider, sender and test delivery"],["/admin/email-logs", Mail, "Email logs", "Delivery status for queued emails"]] as const;

export default function AdminDashboardPage() {
  const { user, loading, refresh } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [removingAdminId, setRemovingAdminId] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [eventAdminMessage, setEventAdminMessage] = useState<string | null>(null);
  const [eventAdminError, setEventAdminError] = useState<string | null>(null);
  const [grantingPartnerId, setGrantingPartnerId] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [platformOverview, setPlatformOverview] = useState<{
    users: { total: number };
    vendors: { total: number; approved: number };
    products: { total: number; active: number };
    orders: { total: number; paid: number; refunded: number };
    gmv: number;
    ttflCommissionRevenue: number;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { void refresh(); }, [refresh]);
  async function loadAdmins() { try { const result = await api.get<{ admins: AdminUser[] }>("/api/admin/admins"); setAdmins(result.admins); } catch { setAdminError("Could not load administrators."); } }
  useEffect(() => { if (user?.role === "ADMIN") { void loadAdmins(); void loadPartners(); } }, [user]);
  async function loadPartners() { try { const result = await api.get<{ partners: any[] }>("/api/partner-events/admin/partners"); setPartners(result.partners); } catch { setEventAdminError("Could not load event partners."); } }
  async function grantFreeEventAccess(partner: any) { setGrantingPartnerId(partner.id); setEventAdminMessage(null); setEventAdminError(null); try { const result = await api.patch<{ partner: any; message: string }>(`/api/partner-events/admin/partners/${partner.id}/event-access`, { plan: "ENTERPRISE", complimentary: true, reason: "Strategic partnership" }); setPartners((items) => items.map((item) => item.id === partner.id ? { ...item, ...result.partner } : item)); setEventAdminMessage(`${partner.organizationName} now has complimentary Enterprise Event Plan access.`); } catch (error) { setEventAdminError(error instanceof ApiError ? error.message : "Could not grant event access."); } finally { setGrantingPartnerId(null); } }

  async function addAdmin(event: React.FormEvent) {
    event.preventDefault(); if (!adminEmail.trim()) return; setAdminLoading(true); setAdminMessage(null); setAdminError(null);
    try { const result = await api.post<{ admin: AdminUser }>("/api/admin/admins", { email: adminEmail.trim() }); setAdmins((current) => current.some((item) => item.id === result.admin.id) ? current : [...current, result.admin]); setAdminEmail(""); setAdminMessage(`${result.admin.email} is now an administrator.`); await refresh(); }
    catch (error) { setAdminError(error instanceof ApiError ? error.message : "Could not add administrator."); }
    finally { setAdminLoading(false); }
  }

  async function sendPasswordReset(event: React.FormEvent) {
    event.preventDefault();
    const email = resetEmail.trim().toLowerCase();
    if (!email) return;

    setResetLoading(true);
    setResetMessage(null);
    setResetError(null);

    try {
      await api.post("/api/auth/forgot-password", { email });
      setResetEmail("");
      setResetMessage(`If an account exists for ${email}, a secure password reset link has been sent.`);
    } catch (error) {
      setResetError(error instanceof ApiError ? error.message : "Could not send the password reset link.");
    } finally {
      setResetLoading(false);
    }
  }

  async function removeAdmin(admin: AdminUser) {
    const confirmed = window.confirm(`Remove administrator access from ${admin.email}? They will keep their TTFL Store account but will no longer have admin access.`);
    if (!confirmed) return;
    setRemovingAdminId(admin.id); setAdminMessage(null); setAdminError(null);
    try { await api.delete(`/api/admin/admins/${admin.id}`); setAdmins((current) => current.filter((item) => item.id !== admin.id)); setAdminMessage(`${admin.email} is no longer an administrator.`); }
    catch (error) { setAdminError(error instanceof ApiError ? error.message : "Could not remove administrator."); }
    finally { setRemovingAdminId(null); }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") {
      api.get<{ overview: typeof platformOverview }>("/api/analytics/admin/overview")
        .then((result) => setPlatformOverview(result.overview))
        .catch(() => setPlatformOverview(null));
    }
  }, [user]);

  const sidebarGroups = [
    {
      label: "Overview",
      links: [["/admin", "Overview", BarChart3]] as const,
    },
    {
      label: "Marketplace",
      links: [
        ["/admin/vendors", "Vendors", Users],
        ["/admin/products", "Products", Package],
        ["/admin/orders", "Orders & refunds", ShoppingBag],
        ["/admin/categories", "Categories", Layers],
        ["/admin/coupons", "Coupons", Ticket],
        ["/admin/featured", "Featured listings", Megaphone],
      ] as const,
    },
    {
      label: "Growth",
      links: [
        ["/admin/analytics", "Analytics", BarChart3],
        ["/admin/plans", "Vendor plans", Layers],
        ["/admin/payouts", "Payouts", Wallet],
        ["/admin/rewards", "TTFL Rewards", Gift],
        ["/admin/broadcast", "Broadcast center", Send],
      ] as const,
    },
    {
      label: "Operations",
      links: [
        ["/admin/events", "Partner events", CalendarDays],
        ["/admin/waitlists", "Coming Soon", BellRing],
        ["/admin/support", "Support", MessageCircle],
        ["/admin/store-reports", "Store reports", FileText],
      ] as const,
    },
    {
      label: "System",
      links: [
        ["/admin/settings", "Platform settings", Settings],
        ["/admin/email-settings", "Email configuration", Mail],
        ["/admin/email-logs", "Email logs", Mail],
        ["/admin/error-logs", "Error logs", AlertTriangle],
        ["/admin/audit-logs", "Audit logs", FileText],
      ] as const,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-cloud-50">
      <div className="flex min-h-[calc(100vh-80px)]">
        {mobileMenuOpen && <button aria-label="Close admin menu" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-30 bg-black/20 lg:hidden" />}
        <aside className={`fixed inset-y-0 left-0 z-40 mt-20 w-72 transform border-r border-graphite-200 bg-white px-4 py-5 transition-transform lg:static lg:z-auto lg:mt-0 lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-5 flex items-center justify-between px-2 lg:hidden">
            <span className="text-sm font-bold text-graphite-900">Admin workspace</span>
            <button onClick={() => setMobileMenuOpen(false)} className="rounded-card p-2 text-graphite-600 hover:bg-cloud-100">×</button>
          </div>
          <div className="space-y-6">
            {sidebarGroups.map((group) => (
              <div key={group.label}>
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-graphite-500">{group.label}</p>
                <nav className="space-y-1">
                  {group.links.map(([href, label, Icon]) => (
                    <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium ${href === "/admin" ? "bg-graphite-900 text-white" : "text-graphite-700 hover:bg-cloud-100"}`}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-graphite-200 bg-white">
            <div className="shell flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="rounded-card border border-graphite-200 p-2 text-graphite-700 lg:hidden" aria-label="Open admin menu">
                  <Layers className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">TTFL Store</p>
                  <h1 className="text-xl font-bold text-graphite-900">Admin overview</h1>
                </div>
              </div>
              <Link href="/admin/broadcast" className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white">
                <Send className="h-4 w-4" /> Broadcast
              </Link>
            </div>
          </div>

          <div className="shell py-7">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-graphite-900">Good to see you, {user.firstName || "Admin"}.</h2>
              <p className="mt-1 text-sm text-graphite-600">Keep an eye on the marketplace, vendors, orders, growth and platform health from one workspace.</p>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <OverviewCard label="Registered users" value={platformOverview?.users.total.toLocaleString() ?? "—"} icon={Users} href="/admin/analytics" />
              <OverviewCard label="Approved vendors" value={platformOverview ? platformOverview.vendors.approved.toLocaleString() : "—"} icon={UserPlus} href="/admin/vendors" />
              <OverviewCard label="Active products" value={platformOverview ? platformOverview.products.active.toLocaleString() : "—"} icon={Package} href="/admin/products" />
              <OverviewCard label="Paid orders" value={platformOverview ? platformOverview.orders.paid.toLocaleString() : "—"} icon={ShoppingBag} href="/admin/orders" />
              <OverviewCard label="TTFL commission" value={platformOverview ? formatNaira(platformOverview.ttflCommissionRevenue) : "—"} icon={Wallet} href="/admin/analytics" />
            </section>

            <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
              <section className="rounded-card border border-graphite-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-graphite-900">Platform snapshot</h2>
                    <p className="mt-1 text-sm text-graphite-600">Live marketplace totals from the admin analytics service.</p>
                  </div>
                  <Link href="/admin/analytics" className="text-sm font-semibold text-ember-700 hover:underline">View analytics</Link>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Snapshot label="Total vendors" value={platformOverview?.vendors.total.toLocaleString() ?? "—"} />
                  <Snapshot label="Total products" value={platformOverview?.products.total.toLocaleString() ?? "—"} />
                  <Snapshot label="Total orders" value={platformOverview?.orders.total.toLocaleString() ?? "—"} />
                  <Snapshot label="Refunded orders" value={platformOverview?.orders.refunded.toLocaleString() ?? "—"} />
                  <Snapshot label="GMV" value={platformOverview ? formatNaira(platformOverview.gmv) : "—"} />
                  <Snapshot label="Commission revenue" value={platformOverview ? formatNaira(platformOverview.ttflCommissionRevenue) : "—"} />
                </div>
              </section>

              <section className="rounded-card border border-graphite-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><ZapIcon /></span>
                  <div>
                    <h2 className="font-bold text-graphite-900">Quick actions</h2>
                    <p className="mt-1 text-sm text-graphite-600">Jump straight into the areas you use most.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <QuickAction href="/admin/vendors" icon={Users} label="Review vendor applications" />
                  <QuickAction href="/admin/orders" icon={ShoppingBag} label="Manage orders & refunds" />
                  <QuickAction href="/admin/support" icon={MessageCircle} label="Open support center" />
                  <QuickAction href="/admin/broadcast" icon={Send} label="Send an announcement" />
                  <QuickAction href="/admin/events" icon={CalendarDays} label="Manage partner events" />
                  <QuickAction href="/admin/settings" icon={Settings} label="Platform settings" />
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Gift className="h-5 w-5"/></span>
                <div>
                  <h2 className="font-bold text-graphite-900">Partner event-plan access</h2>
                  <p className="mt-0.5 text-sm text-graphite-600">Give strategic partners complimentary access to the Event Plan.</p>
                </div>
              </div>
              {eventAdminMessage&&<p className="mt-3 rounded-card bg-verified-100 px-3 py-2 text-sm text-verified-700">{eventAdminMessage}</p>}
              {eventAdminError&&<p className="mt-3 rounded-card bg-ember-100 px-3 py-2 text-sm text-ember-700">{eventAdminError}</p>}
              <div className="mt-4 divide-y divide-graphite-200 border-t border-graphite-200">
                {partners.length===0?<p className="py-4 text-sm text-graphite-600">No partner applications yet.</p>:partners.map((partner)=><div key={partner.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-graphite-900">{partner.organizationName}</p><p className="text-xs text-graphite-600">{partner.owner?.email} · {partner.status} · {partner.eventPlan} plan</p></div><button type="button" onClick={()=>void grantFreeEventAccess(partner)} disabled={grantingPartnerId===partner.id} className="inline-flex items-center justify-center gap-2 rounded-card bg-graphite-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><Gift className="h-3.5 w-3.5"/>{grantingPartnerId===partner.id?"Granting...":partner.complimentaryAccess?"Complimentary access active":"Grant free Event Plan"}</button></div>)}
              </div>
            </section>

            <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><UserPlus className="h-5 w-5"/></span>
                <div><h2 className="font-bold text-graphite-900">Administrators</h2><p className="mt-0.5 text-sm text-graphite-600">Manage who can access the TTFL Store admin workspace.</p></div>
              </div>
              <form onSubmit={addAdmin} className="mt-4 flex flex-col gap-2 sm:flex-row"><input type="email" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="admin@example.com" className="min-w-0 flex-1 rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600"/><button disabled={adminLoading} className="inline-flex items-center justify-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><UserPlus className="h-4 w-4"/>{adminLoading ? "Adding..." : "Add admin"}</button></form>
              {adminMessage&&<p className="mt-3 rounded-card bg-verified-100 px-3 py-2 text-sm text-verified-700">{adminMessage}</p>}{adminError&&<p className="mt-3 rounded-card bg-ember-100 px-3 py-2 text-sm text-ember-700">{adminError}</p>}
              <div className="mt-4 divide-y divide-graphite-200 border-t border-graphite-200">{admins.map((admin)=><div key={admin.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-graphite-900">{admin.firstName} {admin.lastName}</p><p className="text-xs text-graphite-600">{admin.email}</p></div><div className="flex flex-wrap items-center gap-2 text-xs text-graphite-600"><span className="rounded-[4px] bg-verified-100 px-2 py-1 font-semibold text-verified-700">Admin</span>{admin.emailVerified?<span>Verified email</span>:<span>Unverified email</span>}<button type="button" onClick={() => void removeAdmin(admin)} disabled={removingAdminId === admin.id || admin.id === user.id} title={admin.id === user.id ? "You cannot remove your own administrator access" : "Remove administrator access"} className="inline-flex items-center gap-1 rounded-[4px] border border-ember-200 px-2 py-1 font-semibold text-ember-700 disabled:cursor-not-allowed disabled:opacity-50"><UserMinus className="h-3.5 w-3.5"/>{removingAdminId === admin.id ? "Removing..." : "Remove admin"}</button></div></div>)}</div>
            </section>

            <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><KeyRound className="h-5 w-5"/></span><div><h2 className="font-bold text-graphite-900">User password recovery</h2><p className="mt-0.5 text-sm text-graphite-600">Send a secure password reset link using the existing recovery flow.</p></div></div>
              <form onSubmit={sendPasswordReset} className="mt-4 flex flex-col gap-2 sm:flex-row"><input type="email" required value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} placeholder="user@example.com" autoComplete="email" className="min-w-0 flex-1 rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm text-graphite-900 outline-none focus:border-ember-600"/><button type="submit" disabled={resetLoading} className="inline-flex items-center justify-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><KeyRound className="h-4 w-4"/>{resetLoading ? "Sending..." : "Send reset link"}</button></form>
              {resetMessage && <p className="mt-3 rounded-card bg-verified-100 px-3 py-2 text-sm text-verified-700">{resetMessage}</p>}{resetError && <p className="mt-3 rounded-card bg-ember-100 px-3 py-2 text-sm text-ember-700">{resetError}</p>}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0);
}

function OverviewCard({ label, value, icon: Icon, href }: { label: string; value: string; icon: typeof Users; href: string }) {
  return <Link href={href} className="rounded-card border border-graphite-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-ember-300"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-graphite-600">{label}</span><Icon className="h-4 w-4 text-graphite-500" /></div><p className="mt-2 text-xl font-bold text-graphite-900">{value}</p></Link>;
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return <div className="rounded-card border border-graphite-200 bg-cloud-50 p-4"><p className="text-xs text-graphite-600">{label}</p><p className="mt-1 text-base font-bold text-graphite-900">{value}</p></div>;
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof Users; label: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-card border border-graphite-200 px-3 py-3 text-sm font-semibold text-graphite-800 hover:border-ember-300 hover:bg-cloud-50"><Icon className="h-4 w-4 text-graphite-500" />{label}<span className="ml-auto text-graphite-400">→</span></Link>;
}

function ZapIcon() {
  return <span className="text-sm font-bold">✦</span>;
}