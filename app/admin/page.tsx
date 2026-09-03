"use client";

import Link from "next/link";
import { Users, Package, BarChart3, Wallet, Ticket, Megaphone, Layers, MessageCircle, Settings, FileText, Mail, ShoppingBag, Send } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="shell py-16 text-center"><p className="text-sm text-graphite-600">Loading...</p></div>;
  if (!user || user.role !== "ADMIN") return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900">Admin access only</h1></div>;
  return <div className="shell py-8"><div className="flex items-center justify-between gap-4"><div><h1 className="text-xl font-bold text-graphite-900">Admin</h1><p className="mt-1 text-sm text-graphite-600">Manage TTFL Store from one place.</p></div><Link href="/admin/broadcast" className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800"><Send className="h-4 w-4" /> Broadcast</Link></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{LINKS.map(([href, Icon, title, desc]) => <Link key={href} href={href} className="flex items-center gap-4 rounded-card border border-graphite-200 p-5 hover:border-ember-600"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Icon className="h-5 w-5" /></span><div><p className="font-semibold text-graphite-900">{title}</p><p className="text-sm text-graphite-600">{desc}</p></div></Link>)}</div></div>;
}
