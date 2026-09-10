"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, Plus, AlertCircle, CreditCard, Wallet, BarChart3, Megaphone, Ticket, Settings, Palette, Users, Zap, Bell, Rocket, TrendingUp, PartyPopper } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

type Membership = { vendorId: string; isOwner: boolean; role: string; permissions: string[] } | null;
type VendorGrowth = { productCount: number; productLimit: number | null; tier: string; paidOrderCount: number };
const LINKS = [
  { href: "/vendor/dashboard/products", permission: "PRODUCTS", icon: Package, title: "My products", desc: "List, edit, and manage inventory" },
  { href: "/vendor/dashboard/orders", permission: "ORDERS", icon: ShoppingBag, title: "Orders", desc: "Fulfill orders from your store" },
  { href: "/vendor/dashboard/analytics", permission: "FINANCE", icon: BarChart3, title: "Analytics", desc: "Views, clicks, revenue, best sellers" },
  { href: "/vendor/dashboard/payouts", permission: "FINANCE", icon: Wallet, title: "Payouts", desc: "View balances and settlement details" },
  { href: "/vendor/dashboard/subscription", permission: "MANAGER", icon: CreditCard, title: "Subscription", desc: "Manage your plan and billing" },
  { href: "/vendor/dashboard/promote", permission: "PRODUCTS", icon: Megaphone, title: "Promote", desc: "Feature a product or your store" },
  { href: "/vendor/dashboard/flash-deals", permission: "PRODUCTS", icon: Zap, title: "Flash deals", desc: "Run limited-time product discounts" },
  { href: "/vendor/dashboard/launches", permission: "PRODUCTS", icon: Rocket, title: "Launch campaigns", desc: "Schedule and launch products" },
  { href: "/vendor/dashboard/coupons", permission: "MANAGER", icon: Ticket, title: "Coupons", desc: "Discount codes for your store" },
  { href: "/vendor/dashboard/store-settings", permission: "MANAGER", icon: Settings, title: "Store settings", desc: "Manage your store profile and branding" },
  { href: "/vendor/dashboard/notifications", permission: "MANAGER", icon: Bell, title: "Notifications", desc: "Choose email, WhatsApp, and marketing alerts" },
  { href: "/vendor/dashboard/public-profile", permission: "MANAGER", icon: Palette, title: "Public profile", desc: "Enterprise storefront appearance and gallery" },
  { href: "/vendor/dashboard/team", ownerOnly: true, icon: Users, title: "Team", desc: "Invite staff and manage permissions" },
] as const;

export default function VendorDashboardPage() {
  const { user, loading } = useAuth();
  const [membership, setMembership] = useState<Membership>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [growth, setGrowth] = useState<VendorGrowth | null>(null);

  useEffect(() => { if (loading || !user) return; void api.get<{ membership: Membership }>("/api/vendor-staff/me").then(({ membership: next }) => setMembership(next)).catch(() => setMembership(null)).finally(() => setMembershipLoading(false)); }, [loading, user]);
  useEffect(() => { if (!loading && !user) setMembershipLoading(false); }, [loading, user]);

  useEffect(() => {
    if (loading || !user || !membership?.isOwner || user.vendorProfile?.status !== "APPROVED") return;
    void Promise.allSettled([
      api.get<{ products: Array<{ id: string; status?: string }> }>("/api/products/mine"),
      api.get<{ subscription: { plan: { tier: string; productLimit: number | null } } | null }>("/api/subscriptions/me"),
      api.get<{ orders: Array<{ order?: { paymentStatus?: string } }> }>("/api/orders/vendor/mine"),
    ]).then(([productsResult, subscriptionResult, ordersResult]) => {
      const products = productsResult.status === "fulfilled" ? productsResult.value.products : [];
      const subscription = subscriptionResult.status === "fulfilled" ? subscriptionResult.value.subscription : null;
      const orders = ordersResult.status === "fulfilled" ? ordersResult.value.orders : [];
      const paidOrderCount = orders.filter((item) => item.order?.paymentStatus === "PAID").length;
      setGrowth({ productCount: products.filter((product) => product.status !== "SUSPENDED").length, productLimit: subscription?.plan.productLimit ?? null, tier: subscription?.plan.tier ?? user.vendorProfile?.tier ?? "FREE", paidOrderCount });
    });
  }, [loading, user, membership]);

  if (loading || membershipLoading) return <div className="shell py-16 text-center text-sm text-graphite-600 dark:text-graphite-400">Loading dashboard…</div>;
  if (!user || (!membership && user.role !== "VENDOR")) return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900 dark:text-white">Vendor access only</h1><p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Log in with a vendor account, or <Link href="/sell" className="font-medium text-ember-600">apply to sell</Link>.</p></div>;
  const canSee = (link: (typeof LINKS)[number]) => { if (membership?.isOwner) return true; if ("ownerOnly" in link) return false; return membership?.permissions.includes(link.permission) ?? false; };
  const visibleLinks = LINKS.filter(canSee);
  const nearLimit = Boolean(growth?.productLimit && growth.productCount >= Math.max(1, growth.productLimit - 3));
  const firstProduct = growth?.productCount === 1;
  const firstOrder = growth?.paidOrderCount === 1;
  return <div className="shell py-8">
    <h1 className="text-xl font-bold text-graphite-900 dark:text-white">{user.vendorProfile?.storeName ?? "Vendor dashboard"}</h1>
    {!membership?.isOwner && membership && <p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Team role: <span className="font-semibold">{membership.role}</span></p>}
    {user.vendorProfile && user.vendorProfile.status !== "APPROVED" && <div className="mt-4 flex items-start gap-3 rounded-card bg-gold-100 p-4 dark:bg-[#2B2517]"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" /><div><p className="text-sm font-semibold text-graphite-900 dark:text-white">{user.vendorProfile.status === "PENDING" && "Your application is under review"}{user.vendorProfile.status === "REJECTED" && "Your application was not approved"}{user.vendorProfile.status === "SUSPENDED" && "Your store is currently suspended"}</p><p className="mt-0.5 text-sm text-graphite-700 dark:text-graphite-300">{user.vendorProfile.status === "PENDING" && "You can't list products yet — we'll email you once you're approved."}{user.vendorProfile.status === "REJECTED" && "Contact support if you'd like to appeal this decision."}{user.vendorProfile.status === "SUSPENDED" && "Contact support to resolve this."}</p></div></div>}

    {growth && (nearLimit || growth.productLimit !== null) && <div className="mt-5 flex flex-col gap-4 rounded-card border border-ember-200 bg-ember-50 p-4 dark:border-ember-500/30 dark:bg-ember-950/30 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-ember-600 text-white"><TrendingUp className="h-5 w-5" /></span><div><p className="text-sm font-bold text-graphite-900 dark:text-white">{nearLimit ? "You're close to your product limit" : "Increase your business on TTFL Store"}</p><p className="mt-0.5 text-sm text-graphite-600 dark:text-graphite-300">{nearLimit ? `You have ${Math.max(0, growth.productLimit! - growth.productCount)} product slot${growth.productLimit! - growth.productCount === 1 ? "" : "s"} left on your ${growth.tier} plan.` : "Upgrade your plan to list more products and unlock a lower marketplace commission."}</p></div></div><Link href="/vendor/dashboard/subscription" className="inline-flex shrink-0 items-center justify-center rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">View plans</Link></div>}

    {firstProduct && <div className="mt-4 flex items-start gap-3 rounded-card border border-verified-200 bg-verified-50 p-4 dark:border-verified-500/30 dark:bg-verified-950/20"><PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-verified-600" /><div><p className="text-sm font-bold text-graphite-900 dark:text-white">🎉 Congratulations! Your first product is live.</p><p className="mt-0.5 text-sm text-graphite-600 dark:text-graphite-300">Your store is officially open for business. Keep adding products to reach more customers.</p></div></div>}
    {firstOrder && <div className="mt-4 flex items-start gap-3 rounded-card border border-gold-200 bg-gold-50 p-4 dark:border-gold-500/30 dark:bg-gold-950/20"><PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" /><div><p className="text-sm font-bold text-graphite-900 dark:text-white">🥳 Congratulations on your first order!</p><p className="mt-0.5 text-sm text-graphite-600 dark:text-graphite-300">You've made your first sale on TTFL Store. Head to Orders to review and fulfill it.</p></div><Link href="/vendor/dashboard/orders" className="ml-auto shrink-0 text-sm font-semibold text-ember-600 hover:text-ember-700">View order</Link></div>}

    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleLinks.map(({ href, icon: Icon, title, desc }) => <Link key={href} href={href} className="flex items-center gap-4 rounded-card border border-graphite-200 p-5 hover:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:hover:border-ember-500"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700 dark:bg-graphite-800 dark:text-graphite-200"><Icon className="h-5 w-5" /></span><div><p className="font-semibold text-graphite-900 dark:text-white">{title}</p><p className="text-sm text-graphite-600 dark:text-graphite-400">{desc}</p></div></Link>)}</div>
    {membership?.isOwner && user.vendorProfile?.status === "APPROVED" && <Link href="/vendor/dashboard/products/new" className="mt-6 inline-flex items-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"><Plus className="h-4 w-4" />List a new product</Link>}
  </div>;
}
