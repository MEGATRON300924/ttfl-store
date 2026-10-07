"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import {
  BarChart3, Bell, Bot, CalendarDays, ChevronRight, Clock3, Copy, CreditCard,
  ExternalLink, LayoutDashboard, LogOut, Megaphone, Menu, MessageCircle, Package,
  Palette, Plus, Power, Rocket, Settings, ShoppingBag, Store, Tag, Ticket,
  Trash2, TrendingUp, UserRound, Users, Wallet, Wrench, X, Zap
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { VendorDashboardTutorial, VendorTutorialsSection } from "@/components/vendor-dashboard-tutorial";

type Membership = { vendorId: string; isOwner: boolean; role: string; permissions: string[] } | null;
type Product = {
  id: string;
  name: string;
  slug?: string;
  status?: string;
  price?: number | string;
  viewCount?: number;
  createdAt?: string;
  images?: Array<{ url: string }>;
};
type Growth = {
  productCount: number;
  productLimit: number | null;
  tier: string;
  paidOrderCount: number;
  viewCount: number;
  activeProductCount: number;
};
type Setup = {
  completed: number;
  total: number;
  percentage: number;
  items: Array<{ key: string; label: string; done: boolean; href: string }>;
};

const NAV_GROUPS = [
  { label: "Workspace", items: [
    { key: "overview", href: "/vendor/dashboard", icon: LayoutDashboard, title: "Overview" },
    { key: "products", href: "/vendor/dashboard/products", icon: Package, title: "Products" },
    { key: "services", href: "/vendor/dashboard/services", icon: Wrench, title: "Services" },
    { key: "orders", href: "/vendor/dashboard/orders", icon: ShoppingBag, title: "Orders" },
    { key: "bookings", href: "/vendor/dashboard/bookings", icon: CalendarDays, title: "Bookings" },
  ]},
  { label: "Growth", items: [
    { key: "analytics", href: "/vendor/dashboard/analytics", icon: BarChart3, title: "Analytics" },
    { key: "ads", href: "/vendor/dashboard/ads", icon: Megaphone, title: "Ad Centre" },
    { key: "promote", href: "/vendor/dashboard/promote", icon: TrendingUp, title: "Promote" },
    { key: "deals", href: "/vendor/dashboard/flash-deals", icon: Zap, title: "Flash deals" },
    { key: "coupons", href: "/vendor/dashboard/coupons", icon: Ticket, title: "Coupons" },
  ]},
  { label: "Money", items: [
    { key: "payouts", href: "/vendor/dashboard/payouts", icon: Wallet, title: "Payouts" },
    { key: "subscription", href: "/vendor/dashboard/subscription", icon: CreditCard, title: "Subscription" },
  ]},
  { label: "Store", items: [
    { key: "store", href: "/vendor/dashboard/store-settings", icon: Store, title: "Store settings" },
    { key: "setup", href: "/vendor/dashboard/store-setup", icon: Clock3, title: "Store setup" },
    { key: "profile", href: "/vendor/dashboard/public-profile", icon: Palette, title: "Public profile" },
    { key: "hours", href: "/vendor/dashboard/business-hours", icon: CalendarDays, title: "Business hours" },
    { key: "notifications", href: "/vendor/dashboard/notifications", icon: Bell, title: "Notifications" },
    { key: "team", href: "/vendor/dashboard/team", icon: Users, title: "Team", ownerOnly: true },
  ]},
] as const;

function StoreIcon(props: ComponentProps<"svg">) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h18M5 10v9h14v-9M4 10l2-5h12l2 5M9 19v-5h6v5"/></svg>;
}

export default function VendorDashboardPage() {
  const { user, loading, logout } = useAuth();
  const [membership, setMembership] = useState<Membership>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [growth, setGrowth] = useState<Growth | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [accountAction, setAccountAction] = useState<"disable" | "delete" | null>(null);
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    if (!loading && user && window.localStorage.getItem("ttfl_vendor_whatsapp_popup_dismissed") !== "1") {
      setShowWhatsAppPopup(true);
    }
  }, [loading, user]);

  useEffect(() => {
    if (loading || !user) return;
    void api.get<{ membership: Membership }>("/api/vendor-staff/me")
      .then(({ membership: next }) => setMembership(next))
      .catch(() => setMembership(null))
      .finally(() => setMembershipLoading(false));
  }, [loading, user]);

  useEffect(() => {
    if (!loading && !user) setMembershipLoading(false);
  }, [loading, user]);

  useEffect(() => {
    if (loading || !user || !membership?.isOwner || user.vendorProfile?.status !== "APPROVED") return;
    void api.get<Setup>("/api/store-hours/setup").then(setSetup).catch(() => undefined);

    void Promise.allSettled([
      api.get<{ products: Product[] }>("/api/products/mine"),
      api.get<{ subscription: { plan: { tier: string; productLimit: number | null } } | null }>("/api/subscriptions/me"),
      api.get<{ vendorOrders: Array<{ order?: { paymentStatus?: string } }> }>("/api/orders/vendor/me"),
    ]).then(([productResult, subscriptionResult, orderResult]) => {
      const mine = productResult.status === "fulfilled" ? productResult.value.products || [] : [];
      const subscription = subscriptionResult.status === "fulfilled" ? subscriptionResult.value.subscription : null;
      const orders = orderResult.status === "fulfilled" ? orderResult.value.vendorOrders || [] : [];
      setProducts(mine);
      setGrowth({
        productCount: mine.filter(p => p.status !== "SUSPENDED").length,
        activeProductCount: mine.filter(p => p.status === "ACTIVE" || p.status === "PUBLISHED" || !p.status).length,
        productLimit: subscription?.plan.productLimit ?? null,
        tier: subscription?.plan.tier ?? user.vendorProfile?.tier ?? "FREE",
        paidOrderCount: orders.filter(item => item.order?.paymentStatus === "PAID").length,
        viewCount: mine.reduce((total, product) => total + Number(product.viewCount || 0), 0),
      });
    });
  }, [loading, user, membership]);

  async function handleAccountAction(action: "disable" | "delete") {
    const message = action === "delete"
      ? "Delete your TTFL Store account permanently? This cannot be undone."
      : "Disable your TTFL Store account? You will be logged out and won't be able to sign in until it is reactivated.";
    if (!window.confirm(message)) return;
    setAccountAction(action);
    setAccountError("");
    try {
      await api[action === "delete" ? "delete" : "post"](action === "delete" ? "/api/auth/account" : "/api/auth/disable");
      await logout();
      window.location.href = "/";
    } catch (err) {
      setAccountError(err instanceof ApiError ? err.message : `Couldn't ${action} your account`);
      setAccountAction(null);
    }
  }

  if (loading || membershipLoading) {
    return <main className="min-h-screen bg-cloud-50 dark:bg-[#0b0d10]"><div className="shell flex min-h-screen items-center justify-center text-sm text-graphite-600 dark:text-graphite-400">Loading dashboard…</div></main>;
  }

  if (!user || (!membership && user.role !== "VENDOR")) {
    return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900 dark:text-white">Vendor access only</h1><p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Log in with a vendor account, or <Link href="/sell" className="font-medium text-ember-600">apply to sell</Link>.</p></div>;
  }

  const nearLimit = Boolean(growth?.productLimit && growth.productCount >= Math.max(1, growth.productLimit - 3));
  const setupPercent = setup?.percentage ?? 0;
  const recentProducts = products.slice().sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, 5);

  return (
    <main className="min-h-screen bg-cloud-50 dark:bg-[#0b0d10]">
      {showWhatsAppPopup && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-graphite-200 bg-white shadow-2xl dark:border-graphite-700 dark:bg-graphite-900">
            <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-graphite-500 hover:bg-cloud-100" onClick={() => { setShowWhatsAppPopup(false); localStorage.setItem("ttfl_vendor_whatsapp_popup_dismissed", "1"); }} aria-label="Close"><X size={19}/></button>
            <div className="p-6 sm:p-7">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#25D366] text-white"><MessageCircle size={24}/></div>
              <h2 className="mt-5 text-xl font-bold text-graphite-900 dark:text-white">Join the TTFL Store Vendor Group</h2>
              <p className="mt-2 text-sm leading-6 text-graphite-600 dark:text-graphite-300">Stay updated on new features, vendor tools, announcements and opportunities.</p>
              <a href="https://chat.whatsapp.com/LUlsRgmSFjz2ADeRtXiKl4" target="_blank" rel="noopener noreferrer" onClick={() => { localStorage.setItem("ttfl_vendor_whatsapp_popup_dismissed", "1"); setShowWhatsAppPopup(false); }} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white"><MessageCircle size={19}/>Join WhatsApp Group</a>
              <button onClick={() => { setShowWhatsAppPopup(false); localStorage.setItem("ttfl_vendor_whatsapp_popup_dismissed", "1"); }} className="mt-3 w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-graphite-600 hover:bg-cloud-100">Maybe later</button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-graphite-200 bg-white/95 backdrop-blur dark:border-graphite-800 dark:bg-graphite-950/95">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button className="btn-secondary !px-2.5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19}/></button>
          <Link href="/" className="flex items-center gap-2 font-bold text-graphite-950 dark:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember-600 text-white"><StoreIcon className="h-5 w-5"/></span>
            <span>TTFL Store</span>
            <span className="hidden border-l border-graphite-200 pl-3 text-sm font-semibold text-graphite-500 sm:block">Vendor dashboard</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/vendor/dashboard/max-ai" className="btn-secondary hidden sm:inline-flex"><Bot size={16}/> Max AI</Link>
            <Link href="/vendor/dashboard/products/new" className="btn-primary"><Plus size={16}/> Add product</Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {mobileOpen && <button className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}
        <aside className={`fixed inset-y-0 left-0 z-50 mt-16 flex w-72 flex-col border-r border-graphite-200 bg-white p-4 transition-transform dark:border-graphite-800 dark:bg-graphite-950 lg:sticky lg:top-16 lg:z-0 lg:mt-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-4 flex shrink-0 items-center justify-between lg:hidden"><strong>Menu</strong><button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X/></button></div>
          <div className="mb-4 shrink-0 rounded-2xl border border-graphite-200 bg-cloud-50 p-3 dark:border-graphite-800 dark:bg-graphite-900">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ember-600">Your store</p>
            <p className="mt-1 truncate font-bold text-graphite-900 dark:text-white">{user.vendorProfile?.storeName || "TTFL Store"}</p>
            <p className="mt-1 truncate text-xs text-graphite-500">{user.vendorProfile?.location || "Nigeria"}</p>
            <span className="mt-3 inline-flex rounded-full bg-verified-100 px-2 py-1 text-[11px] font-semibold text-verified-700">{user.vendorProfile?.status === "APPROVED" ? "Active" : user.vendorProfile?.status || "Pending"}</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <nav className="space-y-5">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-graphite-400">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.filter(item => !("ownerOnly" in item) || !item.ownerOnly || membership?.isOwner).map(item => {
                      const Icon = item.icon;
                      return <Link key={item.key} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${item.key === "overview" ? "bg-ember-100 text-ember-700 dark:bg-ember-950/30 dark:text-ember-300" : "text-graphite-600 hover:bg-cloud-100 hover:text-graphite-900 dark:text-graphite-300 dark:hover:bg-graphite-900 dark:hover:text-white"}`}><Icon size={16}/><span>{item.title}</span></Link>;
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-3 shrink-0 border-t border-graphite-200 pt-3 dark:border-graphite-800">
            <Link href="/vendor/dashboard/store-settings" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-graphite-600 dark:text-graphite-300"><Settings size={17}/> Store settings</Link>
            <Link href="/support" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-graphite-600 dark:text-graphite-300"><MessageCircle size={17}/> Support</Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-graphite-600 dark:text-graphite-300"><LogOut size={17}/> Back to TTFL Store</Link>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1240px]">
            {user.vendorProfile?.status !== "APPROVED" && (
              <div className="mb-5 rounded-2xl border border-gold-200 bg-gold-50 p-4 text-sm text-graphite-700 dark:border-gold-500/30 dark:bg-gold-950/20 dark:text-graphite-200">
                Your store status is <strong>{user.vendorProfile?.status || "pending"}</strong>. Some selling features may remain unavailable until approval.
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-ember-600">Seller workspace</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-graphite-950 dark:text-white">Welcome back 👋</h1>
                <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-400">Run your TTFL Store business from one place.</p>
              </div>
              <div className="flex gap-2">
                <Link className="btn-secondary" href={`/store/${encodeURIComponent(user.vendorProfile?.storeSlug || "")}`}>View store <ExternalLink size={15}/></Link>
                <Link className="btn-primary" href="/vendor/dashboard/products/new"><Plus size={16}/> Add product</Link>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Package} label="Products" value={growth?.productCount ?? 0} href="/vendor/dashboard/products"/>
              <StatCard icon={BarChart3} label="Product views" value={growth?.viewCount ?? 0} href="/vendor/dashboard/analytics"/>
              <StatCard icon={ShoppingBag} label="Paid orders" value={growth?.paidOrderCount ?? 0} href="/vendor/dashboard/orders"/>
              <StatCard icon={TrendingUp} label="Active listings" value={growth?.activeProductCount ?? 0} href="/vendor/dashboard/products"/>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[1.45fr_.75fr]">
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div><h2 className="font-bold text-graphite-950 dark:text-white">Store analytics</h2><p className="mt-1 text-sm text-graphite-500">A quick view of how your storefront is performing.</p></div>
                  <Link href="/vendor/dashboard/analytics" className="text-sm font-semibold text-ember-600">View analytics</Link>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Metric label="Total views" value={growth?.viewCount ?? 0} />
                  <Metric label="Listings" value={growth?.productCount ?? 0} />
                  <Metric label="Paid orders" value={growth?.paidOrderCount ?? 0} />
                </div>
                <div className="mt-6 rounded-2xl bg-cloud-50 p-4 dark:bg-graphite-800">
                  <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-ember-100 text-ember-600 dark:bg-ember-950/30 dark:text-ember-300"><BarChart3 size={19}/></div><div><p className="text-sm font-bold text-graphite-900 dark:text-white">Want deeper insights?</p><p className="text-xs text-graphite-500">Open Analytics for traffic, product performance and business trends.</p></div><Link href="/vendor/dashboard/analytics" className="ml-auto text-graphite-500"><ChevronRight size={18}/></Link></div>
                </div>
              </div>

              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><h2 className="font-bold text-graphite-950 dark:text-white">Store setup</h2><p className="mt-1 text-sm text-graphite-500">Build buyer trust.</p></div><strong className="text-sm text-ember-600">{setupPercent}%</strong></div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-ember-100 dark:bg-ember-950"><div className="h-full rounded-full bg-ember-600" style={{ width: `${setupPercent}%` }}/></div>
                <p className="mt-3 text-sm text-graphite-600 dark:text-graphite-400">{setup?.completed ?? 0} of {setup?.total ?? 0} setup items completed.</p>
                <Link href="/vendor/dashboard/store-setup" className="btn-secondary mt-5 w-full">Complete setup <ChevronRight size={16}/></Link>
              </div>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between"><div><h2 className="font-bold text-graphite-950 dark:text-white">Recent products</h2><p className="mt-1 text-sm text-graphite-500">Your latest marketplace listings.</p></div><Link href="/vendor/dashboard/products" className="text-sm font-semibold text-ember-600">View all</Link></div>
                <div className="mt-5 divide-y divide-graphite-200 dark:divide-graphite-800">
                  {recentProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 py-3">
                      {product.images?.[0]?.url ? <img src={product.images[0].url} alt="" className="h-12 w-12 rounded-xl object-cover"/> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-cloud-100 text-graphite-400 dark:bg-graphite-800"><Package size={18}/></div>}
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-graphite-900 dark:text-white">{product.name}</p><p className="mt-1 text-xs text-graphite-500">{Number(product.viewCount || 0)} views · {product.status || "Listed"}</p></div>
                      {product.slug && <Link href={`/products/${product.slug}`} className="text-graphite-400 hover:text-ember-600"><ExternalLink size={16}/></Link>}
                    </div>
                  ))}
                  {!recentProducts.length && <div className="py-8 text-center"><Package className="mx-auto h-9 w-9 text-graphite-300"/><p className="mt-3 text-sm text-graphite-500">No products yet.</p><Link href="/vendor/dashboard/products/new" className="btn-primary mt-4">List your first product</Link></div>}
                </div>
              </div>

              <div className="card p-5 sm:p-6">
                <h2 className="font-bold text-graphite-950 dark:text-white">Quick actions</h2>
                <p className="mt-1 text-sm text-graphite-500">Jump straight into the tools you use most.</p>
                <div className="mt-5 grid gap-2">
                  <QuickAction href="/vendor/dashboard/products/new" icon={Plus} title="Add product" primary/>
                  <QuickAction href="/vendor/dashboard/services" icon={Wrench} title="Manage services"/>
                  <QuickAction href="/vendor/dashboard/orders" icon={ShoppingBag} title="Review orders"/>
                  <QuickAction href="/vendor/dashboard/ads" icon={Megaphone} title="Promote your store"/>
                  <QuickAction href="/vendor/dashboard/coupons" icon={Ticket} title="Create a coupon"/>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-3">
              <InsightCard icon={Zap} title="Grow your reach" text="Use ads, promotions and flash deals to put your products in front of more shoppers." href="/vendor/dashboard/ads" action="Open Ad Centre"/>
              <InsightCard icon={Bot} title="Max AI Analytics" text="Use your Store ID with Max AI to analyze your store and get business insights." href="/vendor/dashboard/max-ai" action="Open Max AI"/>
              <InsightCard icon={CreditCard} title={nearLimit ? "You're close to your product limit" : `You're on the ${growth?.tier || "FREE"} plan`} text={nearLimit ? `${Math.max(0, (growth?.productLimit || 0) - (growth?.productCount || 0))} product slots remaining on your current plan.` : "Manage your plan, billing and available marketplace features."} href="/vendor/dashboard/subscription" action={nearLimit ? "View plans" : "Manage plan"}/>
            </div>

            <div className="mt-7 rounded-2xl border border-graphite-200 bg-white p-5 dark:border-graphite-800 dark:bg-graphite-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[.16em] text-ember-600">Store identity</p><p className="mt-1 text-sm text-graphite-500">Use your Store ID when asking Max AI to analyze your store.</p><div className="mt-2 flex items-center gap-2"><code className="rounded-lg bg-cloud-100 px-3 py-2 font-mono text-sm font-bold dark:bg-graphite-950 dark:text-white">{user.vendorProfile?.id}</code><button type="button" onClick={() => user.vendorProfile?.id && void navigator.clipboard?.writeText(user.vendorProfile.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-graphite-200 px-3 py-2 text-xs font-semibold dark:border-graphite-700 dark:text-white"><Copy size={14}/> Copy</button></div></div>
                <Link href="/vendor/dashboard/max-ai" className="btn-secondary"><Bot size={16}/> Max AI Analytics</Link>
              </div>
            </div>

            {membership?.isOwner && (
              <section className="mt-7 rounded-2xl border border-ember-200 bg-ember-50/60 p-5 dark:border-ember-500/30 dark:bg-ember-950/20">
                <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ember-100 text-ember-700"><Power size={19}/></span><div><h2 className="text-sm font-bold text-graphite-900 dark:text-white">Account controls</h2><p className="mt-1 text-sm text-graphite-600 dark:text-graphite-300">Temporarily disable your account or permanently delete it.</p></div></div>
                {accountError && <p className="mt-3 text-sm font-medium text-ember-700">{accountError}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => void handleAccountAction("disable")} disabled={accountAction !== null} className="btn-secondary"><Power size={16}/>{accountAction === "disable" ? "Disabling…" : "Disable account"}</button>
                  <button type="button" onClick={() => void handleAccountAction("delete")} disabled={accountAction !== null} className="btn-primary"><Trash2 size={16}/>{accountAction === "delete" ? "Deleting…" : "Delete account"}</button>
                </div>
              </section>
            )}

            <VendorTutorialsSection />
          </div>
        </section>
      </div>
      <VendorDashboardTutorial />
    </main>
  );
}

function StatCard({ icon: Icon, label, value, href }: { icon: typeof Package; label: string; value: number; href: string }) {
  return <Link href={href} className="card group p-5 transition hover:-translate-y-0.5 hover:border-ember-300 hover:shadow-md"><Icon className="h-5 w-5 text-ember-600"/><p className="mt-4 text-sm text-graphite-500">{label}</p><strong className="mt-1 block text-2xl text-graphite-950 dark:text-white">{value.toLocaleString()}</strong></Link>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-graphite-200 bg-white p-4 dark:border-graphite-800 dark:bg-graphite-900"><p className="text-xs font-semibold uppercase tracking-wide text-graphite-400">{label}</p><strong className="mt-2 block text-xl text-graphite-950 dark:text-white">{value.toLocaleString()}</strong></div>;
}

function QuickAction({ href, icon: Icon, title }: { href: string; icon: typeof Plus; title: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-xl border border-graphite-200 px-3 py-3 text-sm font-semibold text-graphite-700 transition hover:border-ember-300 hover:bg-ember-50 hover:text-ember-700 dark:border-graphite-800 dark:text-graphite-200 dark:hover:bg-ember-950/20"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cloud-100 dark:bg-graphite-800"><Icon size={16}/></span>{title}<ChevronRight className="ml-auto" size={16}/></Link>;
}

function InsightCard({ icon: Icon, title, text, href, action }: { icon: typeof Zap; title: string; text: string; href: string; action: string }) {
  return <div className="card p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-ember-100 text-ember-600"><Icon size={19}/></span><h2 className="font-bold text-graphite-950 dark:text-white">{title}</h2></div><p className="mt-3 text-sm leading-6 text-graphite-500">{text}</p><Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ember-600">{action}<ChevronRight size={15}/></Link></div>;
}
