import Link from "next/link";
import { Logo } from "@/components/logo";

const columns = [
  { title: "Shop", links: [
    { label: "All categories", href: "/categories" },
    { label: "Deals", href: "/deals" },
    { label: "Featured stores", href: "/featured" },
    { label: "New arrivals", href: "/new" },
  ]},
  { title: "Sell", links: [
    { label: "Become a vendor", href: "/sell" },
    { label: "Vendor tiers & pricing", href: "/sell/pricing" },
    { label: "Vendor login", href: "/vendor/login" },
    { label: "Seller help center", href: "/support/vendors" },
  ]},
  { title: "Earn", links: [
    { label: "Affiliate program", href: "/affiliate" },
    { label: "Affiliate dashboard", href: "/affiliate/dashboard" },
    { label: "Become a vendor", href: "/sell" },
    { label: "Vendor login", href: "/vendor/login" },
  ]},
  { title: "Support", links: [
    { label: "Help center", href: "/support" },
    { label: "Track an order", href: "/orders/track" },
    { label: "Returns & refunds", href: "/support/refunds" },
    { label: "Report a problem", href: "/support/report" },
  ]},
  { title: "Company", links: [
    { label: "About The Tron Forge Limited", href: "/about" },
    { label: "Trust & safety", href: "/trust" },
    { label: "Terms of service", href: "/legal/terms" },
    { label: "Privacy policy", href: "/legal/privacy" },
  ]},
];

export function SiteFooter() {
  return <footer className="border-t border-graphite-200 bg-graphite-950 text-graphite-200"><div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(5,1fr)]"><div><Logo variant="light" /><p className="mt-4 max-w-xs text-sm leading-relaxed text-graphite-400">The official multi-vendor marketplace of The Tron Forge Limited. Verified vendors, secure checkout, and support you can reach.</p></div>{columns.map((col) => <div key={col.title}><h3 className="text-[13px] font-semibold uppercase tracking-wide text-graphite-200">{col.title}</h3><ul className="mt-4 flex flex-col gap-2.5 text-sm text-graphite-400">{col.links.map((l) => <li key={`${col.title}-${l.href}-${l.label}`}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}</ul></div>)}</div><div className="border-t border-graphite-800"><div className="shell flex flex-col gap-2 py-5 text-xs text-graphite-400 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} The Tron Forge Limited. All rights reserved.</p><p>TTFL Store is part of the TTFL ecosystem.</p></div></div></footer>;
}
