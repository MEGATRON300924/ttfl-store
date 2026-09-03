"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Menu, X, MapPin } from "lucide-react";
import { Logo } from "@/components/logo";
import { categories } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const accountHref = !user ? "/login" : user.role === "ADMIN" ? "/admin" : user.role === "VENDOR" ? "/vendor/dashboard" : "/account";

  return (
    <header className="sticky top-0 z-40 border-b border-graphite-200 bg-white shadow-sm">
      <div className="hidden border-b border-graphite-200 bg-graphite-950 text-graphite-200 md:block"><div className="shell flex h-9 items-center justify-between text-[13px]"><div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /><span>Deliver to Nigeria</span></div><nav className="flex items-center gap-5"><Link href="/sell" className="hover:text-white">Sell on TTFL Store</Link><Link href="/support" className="hover:text-white">Support</Link><Link href="/vendor/login" className="hover:text-white">Vendor login</Link></nav></div></div>
      <div className="shell flex h-16 items-center gap-3 sm:gap-4">
        <button className="grid h-9 w-9 place-items-center rounded-card text-graphite-700 md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <Logo />
        <form role="search" className="hidden flex-1 items-center md:flex" action="/search"><div className="flex w-full items-center rounded-card border border-graphite-200 bg-cloud-50 focus-within:border-ember-600"><Search className="ml-3 h-4 w-4 shrink-0 text-graphite-600" aria-hidden /><input name="q" type="search" placeholder="Search products, brands or vendors" className="w-full bg-transparent px-2.5 py-2.5 text-sm text-graphite-900 outline-none placeholder:text-graphite-600" /><button type="submit" className="m-1 shrink-0 rounded-[7px] bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800">Search</button></div></form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/wishlist" className="hidden h-9 w-9 place-items-center rounded-card text-graphite-700 hover:bg-cloud-100 sm:grid" aria-label="Wishlist"><Heart className="h-5 w-5" /></Link>
          <Link href={accountHref} className="hidden h-9 w-9 place-items-center rounded-card text-graphite-700 hover:bg-cloud-100 md:grid" aria-label="Account"><User className="h-5 w-5" /></Link>
          <Link href="/cart" className="relative flex h-9 items-center gap-1.5 rounded-card px-2.5 text-graphite-700 hover:bg-cloud-100" aria-label="Cart"><ShoppingCart className="h-5 w-5" /><span className="hidden text-sm font-medium sm:inline">Cart</span>{totalItems > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ember-600 px-1 font-mono text-[10px] font-medium text-white">{totalItems}</span>}</Link>
        </div>
      </div>
      <form role="search" className="shell pb-3 md:hidden" action="/search"><div className="flex items-center rounded-card border border-graphite-200 bg-cloud-50"><Search className="ml-3 h-4 w-4 shrink-0 text-graphite-600" aria-hidden /><input name="q" type="search" placeholder="Search TTFL Store" className="w-full bg-transparent px-2.5 py-2.5 text-sm outline-none placeholder:text-graphite-600" /></div></form>
      <nav className="hidden border-t border-graphite-200 md:block"><div className="shell flex h-11 items-center gap-6 overflow-x-auto text-[13px] font-medium text-graphite-700">{categories.map((c) => <Link key={c.id} href={`/categories/${c.slug}`} className="shrink-0 hover:text-ember-600">{c.name}</Link>)}</div></nav>
      {menuOpen && <div className="fixed inset-0 z-50 md:hidden"><button className="absolute inset-0 bg-graphite-950/50" aria-label="Close menu" onClick={() => setMenuOpen(false)} /><div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-white p-5"><div className="mb-6 flex items-center justify-between"><Logo /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X className="h-5 w-5 text-graphite-700" /></button></div><div className="flex flex-col gap-1 text-[15px] font-medium text-graphite-900">{categories.map((c) => <Link key={c.id} href={`/categories/${c.slug}`} className="rounded-card px-2 py-2.5 hover:bg-cloud-100" onClick={() => setMenuOpen(false)}>{c.name}</Link>)}</div><div className="mt-auto flex flex-col gap-1 border-t border-graphite-200 pt-4 text-sm text-graphite-700"><Link href={accountHref} className="py-2 font-semibold text-ember-600" onClick={() => setMenuOpen(false)}>My account</Link><Link href="/sell" className="py-2">Sell on TTFL Store</Link><Link href="/vendor/login" className="py-2">Vendor login</Link><Link href="/support" className="py-2">Support</Link></div></div></div>}
    </header>
  );
}
