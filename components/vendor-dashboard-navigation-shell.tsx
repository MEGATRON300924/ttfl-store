"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3, Bell, Bot, CalendarDays, CreditCard, LayoutDashboard, LogOut,
  Megaphone, Menu, MessageCircle, Package, Palette, Plus, ShoppingBag,
  Store, Ticket, TrendingUp, Users, Wallet, Wrench, X, Zap
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Membership = { vendorId: string; isOwner: boolean; role: string; permissions: string[] } | null;

const NAV_GROUPS = [
  { label: "Workspace", items: [
    { href: "/vendor/dashboard", icon: LayoutDashboard, title: "Overview" },
    { href: "/vendor/dashboard/products", icon: Package, title: "Products" },
    { href: "/vendor/dashboard/services", icon: Wrench, title: "Services" },
    { href: "/vendor/dashboard/orders", icon: ShoppingBag, title: "Orders" },
    { href: "/vendor/dashboard/bookings", icon: CalendarDays, title: "Bookings" },
  ]},
  { label: "Growth", items: [
    { href: "/vendor/dashboard/analytics", icon: BarChart3, title: "Analytics" },
    { href: "/vendor/dashboard/ads", icon: Megaphone, title: "Ad Centre" },
    { href: "/vendor/dashboard/promote", icon: TrendingUp, title: "Promote" },
    { href: "/vendor/dashboard/flash-deals", icon: Zap, title: "Flash deals" },
    { href: "/vendor/dashboard/coupons", icon: Ticket, title: "Coupons" },
  ]},
  { label: "Money", items: [
    { href: "/vendor/dashboard/payouts", icon: Wallet, title: "Payouts" },
    { href: "/vendor/dashboard/subscription", icon: CreditCard, title: "Subscription" },
  ]},
  { label: "Store", items: [
    { href: "/vendor/dashboard/store-settings", icon: Store, title: "Store settings" },
    { href: "/vendor/dashboard/store-setup", icon: CalendarDays, title: "Store setup" },
    { href: "/vendor/dashboard/public-profile", icon: Palette, title: "Public profile" },
    { href: "/vendor/dashboard/business-hours", icon: CalendarDays, title: "Business hours" },
    { href: "/vendor/dashboard/notifications", icon: Bell, title: "Notifications" },
    { href: "/vendor/dashboard/team", icon: Users, title: "Team", ownerOnly: true },
  ]},
] as const;

function isActive(pathname: string, href: string) {
  return href === "/vendor/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export default function VendorDashboardNavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [membership, setMembership] = useState<Membership>(null);

  useEffect(() => {
    if (user && pathname !== "/vendor/dashboard") {
      fetch("/api/vendor-staff/me").then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setMembership(data.membership ?? null);
        }
      }).catch(() => undefined);
    }
  });

  return (
    <main className="min-h-screen bg-cloud-50 dark:bg-[#0b0d10]">
      <header className="sticky top-0 z-40 border-b border-graphite-200 bg-white/95 backdrop-blur dark:border-graphite-800 dark:bg-graphite-950/95">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button className="btn-secondary !px-2.5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19}/></button>
          <Link href="/" className="flex items-center gap-2 font-bold text-graphite-950 dark:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember-600 text-white"><Store className="h-5 w-5"/></span>
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
            <p className="mt-1 truncate font-bold text-graphite-900 dark:text-white">{user?.vendorProfile?.storeName || "TTFL Store"}</p>
            <p className="mt-1 truncate text-xs text-graphite-500">{user?.vendorProfile?.location || "Nigeria"}</p>
            <span className="mt-3 inline-flex rounded-full bg-verified-100 px-2 py-1 text-[11px] font-semibold text-verified-700">{user?.vendorProfile?.status === "APPROVED" ? "Active" : user?.vendorProfile?.status || "Pending"}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <nav className="space-y-5">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-graphite-400">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.filter(item => !("ownerOnly" in item) || !item.ownerOnly || membership?.isOwner).map(item => {
                      const Icon = item.icon;
                      const active = isActive(pathname, item.href);
                      return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-ember-100 text-ember-700 dark:bg-ember-950/30 dark:text-ember-300" : "text-graphite-600 hover:bg-cloud-100 hover:text-graphite-900 dark:text-graphite-300 dark:hover:bg-graphite-900 dark:hover:text-white"}`}><Icon size={16}/><span>{item.title}</span></Link>;
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          <div className="mt-3 shrink-0 border-t border-graphite-200 pt-3 dark:border-graphite-800">
            <Link href="/vendor/dashboard/store-settings" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-graphite-600 dark:text-graphite-300"><Store size={17}/> Store settings</Link>
            <Link href="/support" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-graphite-600 dark:text-graphite-300"><MessageCircle size={17}/> Support</Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-graphite-600 dark:text-graphite-300"><LogOut size={17}/> Back to TTFL Store</Link>
          </div>
        </aside>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}
