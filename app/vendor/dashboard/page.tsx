"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, Plus, AlertCircle, CreditCard, Wallet, BarChart3, Megaphone, Ticket, Settings, Palette, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

type Membership = { vendorId: string; isOwner: boolean; role: string; permissions: string[] } | null;
const LINKS = [
  { href: "/vendor/dashboard/products", permission: "PRODUCTS", icon: Package, title: "My products", desc: "List, edit, and manage inventory" },
  { href: "/vendor/dashboard/orders", permission: "ORDERS", icon: ShoppingBag, title: "Orders", desc: "Fulfill orders from your store" },
  { href: "/vendor/dashboard/analytics", permission: "FINANCE", icon: BarChart3, title: "Analytics", desc: "Views, clicks, revenue, best sellers" },
  { href: "/vendor/dashboard/payouts", permission: "FINANCE", icon: Wallet, title: "Payouts", desc: "View balances and settlement details" },
  { href: "/vendor/dashboard/subscription", permission: "MANAGER", icon: CreditCard, title: "Subscription", desc: "Manage your plan and billing" },
  { href: "/vendor/dashboard/promote", permission: "PRODUCTS", icon: Megaphone, title: "Promote", desc: "Feature a product or your store" },
  { href: "/vendor/dashboard/coupons", permission: "MANAGER", icon: Ticket, title: "Coupons", desc: "Discount codes for your store" },
  { href: "/vendor/dashboard/store-settings", permission: "MANAGER", icon: Settings, title: "Store settings", desc: "Manage your store profile and branding" },
  { href: "/vendor/dashboard/public-profile", permission: "MANAGER", icon: Palette, title: "Public profile", desc: "Enterprise storefront appearance and gallery" },
  { href: "/vendor/dashboard/team", ownerOnly: true, icon: Users, title: "Team", desc: "Invite staff and manage permissions" },
] as const;

export default function VendorDashboardPage() {
  const { user, loading } = useAuth();
  const [membership, setMembership] = useState<Membership>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);
  useEffect(() => { if (loading || !user) return; void api.get<{ membership: Membership }>("/api/vendor-staff/me").then(({ membership }) => setMembership(membership)).catch(() => setMembership(null)).finally(() => setMembershipLoading(false)); }, [loading, user]);
  useEffect(() => { if (!loading && !user) setMembershipLoading(false); }, [loading, user]);
  if (loading || membershipLoading) return <div className="shell py-16 text-center text-sm text-graphite-600">Loading dashboard…</div>;
  if (!user || (!membership && user.role !== "VENDOR")) return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900">Vendor access only</h1><p className="mt-1 text-sm text-graphite-600">Log in with a vendor account, or <Link href="/sell" className="font-medium text-ember-600">apply to sell</Link>.</p></div>;
  const canSee = (link: (typeof LINKS)[number]) => { if (membership?.isOwner) return true; if ("ownerOnly" in link) return false; return membership?.permissions.includes(link.permission) ?? false; };
  const visibleLinks = LINKS.filter(canSee);
  return <div className="shell py-8"><h1 className="text-xl font-bold text-graphite-900">{user.vendorProfile?.storeName ?? "Vendor dashboard"}</h1>{!membership?.isOwner && membership && <p className="mt-1 text-sm text-graphite-600">Team role: <span className="font-semibold">{membership.role}</span></p>}{user.vendorProfile && user.vendorProfile.status !== "APPROVED" && <div className="mt-4 flex items-start gap-3 rounded-card bg-gold-100 p-4"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" /><div><p className="text-sm font-semibold text-graphite-900">{user.vendorProfile.status === "PENDING" && "Your application is under review"}{user.vendorProfile.status === "REJECTED" && "Your application was not approved"}{user.vendorProfile.status === "SUSPENDED" && "Your store is currently suspended"}</p><p className="mt-0.5 text-sm text-graphite-700">{user.vendorProfile.status === "PENDING" && "You can't list products yet — we'll email you once you're approved."}{user.vendorProfile.status === "REJECTED" && "Contact support if you'd like to appeal this decision."}{user.vendorProfile.status === "SUSPENDED" && "Contact support to resolve this."}</p></div></div>}<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleLinks.map(({ href, icon: Icon, title, desc }) => <Link key={href} href={href} className="flex items-center gap-4 rounded-card border border-graphite-200 p-5 hover:border-ember-600"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Icon className="h-5 w-5" /></span><div><p className="font-semibold text-graphite-900">{title}</p><p className="text-sm text-graphite-600">{desc}</p></div></Link>)}</div>{membership?.isOwner && user.vendorProfile?.status === "APPROVED" && <Link href="/vendor/dashboard/products/new" className="mt-6 inline-flex items-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"><Plus className="h-4 w-4" />List a new product</Link>}</div>;
}
