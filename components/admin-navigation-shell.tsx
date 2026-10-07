"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  CalendarDays,
  FileText,
  Gift,
  Layers,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  Package,
  Send,
  Settings,
  ShoppingBag,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";

const GROUPS = [
  { label: "Overview", links: [["/admin", "Overview", BarChart3]] as const },
  { label: "Marketplace", links: [
    ["/admin/vendors", "Vendors", Users],
    ["/admin/products", "Products", Package],
    ["/admin/orders", "Orders & refunds", ShoppingBag],
    ["/admin/categories", "Categories", Layers],
    ["/admin/coupons", "Coupons", Ticket],
    ["/admin/featured", "Featured listings", Megaphone],
  ] as const },
  { label: "Growth", links: [
    ["/admin/analytics", "Analytics", BarChart3],
    ["/admin/plans", "Vendor plans", Layers],
    ["/admin/payouts", "Payouts", Wallet],
    ["/admin/rewards", "TTFL Rewards", Gift],
    ["/admin/broadcast", "Broadcast center", Send],
  ] as const },
  { label: "Operations", links: [
    ["/admin/events", "Partner events", CalendarDays],
    ["/admin/waitlists", "Coming Soon", BellRing],
    ["/admin/support", "Support", MessageCircle],
    ["/admin/store-reports", "Store reports", FileText],
  ] as const },
  { label: "System", links: [
    ["/admin/settings", "Platform settings", Settings],
    ["/admin/email-settings", "Email configuration", Mail],
    ["/admin/email-logs", "Email logs", Mail],
    ["/admin/error-logs", "Error logs", AlertTriangle],
    ["/admin/audit-logs", "Audit logs", FileText],
  ] as const },
];

export default function AdminNavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The admin overview already owns its dashboard sidebar.
  if (pathname === "/admin") return <>{children}</>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-cloud-50">
      {open && <button aria-label="Close admin menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/20 lg:hidden" />}
      <div className="flex min-h-[calc(100vh-80px)]">
        <aside className={`fixed inset-y-0 left-0 z-40 mt-20 flex w-72 flex-col border-r border-graphite-200 bg-white px-4 py-5 transition-transform lg:static lg:z-auto lg:mt-0 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-5 flex items-center justify-between px-2 lg:hidden">
            <span className="text-sm font-bold text-graphite-900">Admin workspace</span>
            <button onClick={() => setOpen(false)} className="rounded-card p-2 text-graphite-600 hover:bg-cloud-100" aria-label="Close admin menu"><X className="h-5 w-5" /></button>
          </div>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
            {GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-graphite-500">{group.label}</p>
                <nav className="space-y-1">
                  {group.links.map(([href, label, Icon]) => {
                    const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium ${active ? "bg-graphite-900 text-white" : "text-graphite-700 hover:bg-cloud-100"}`}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
          <div className="mt-4 shrink-0 border-t border-graphite-200 pt-4">
            <Link href="/admin/broadcast" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-card px-3 py-2 text-sm font-semibold text-graphite-700 hover:bg-cloud-100"><Send className="h-4 w-4" /> Broadcast center</Link>
            <Link href="/" className="mt-1 flex items-center gap-2 rounded-card px-3 py-2 text-sm font-semibold text-graphite-700 hover:bg-cloud-100"><ShoppingBag className="h-4 w-4" /> Back to TTFL Store</Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-graphite-200 bg-white">
            <div className="shell flex items-center justify-between gap-4 py-3.5">
              <div className="flex items-center gap-3">
                <button onClick={() => setOpen(true)} className="rounded-card border border-graphite-200 p-2 text-graphite-700 lg:hidden" aria-label="Open admin menu"><Menu className="h-5 w-5" /></button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">TTFL Store</p>
                  <p className="text-lg font-bold text-graphite-900">Admin workspace</p>
                </div>
              </div>
              <Link href="/admin/broadcast" className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-3.5 py-2 text-sm font-semibold text-white"><Send className="h-4 w-4" /> Broadcast</Link>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
