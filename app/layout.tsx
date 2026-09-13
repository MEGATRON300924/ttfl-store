import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AffiliateTracker } from "@/components/affiliate-tracker";
import { BroadcastPopup } from "@/components/broadcast-popup";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { SiteStructuredData } from "@/components/site-structured-data";

const SITE_URL = "https://ttflstore.name.ng";
const MAINTENANCE_MODE = true;
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "TTFL Store — Buy & Sell in Nigeria", template: "%s | TTFL Store" },
  description: "Shop products from vendors across Nigeria on TTFL Store, the marketplace from The Tron Forge Limited.",
  applicationName: "TTFL Store",
  category: "shopping",
  creator: "The Tron Forge Limited",
  publisher: "The Tron Forge Limited",
  icons: { icon: "/ttflstore.png", apple: "/ttflstore.png" },
  alternates: { canonical: SITE_URL },
  openGraph: { type: "website", siteName: "TTFL Store", title: "TTFL Store — Buy & Sell in Nigeria", description: "Shop products from vendors across Nigeria on TTFL Store.", url: SITE_URL, locale: "en_NG", images: [{ url: "/ttflstore.png", width: 1200, height: 630, alt: "TTFL Store" }] },
  twitter: { card: "summary_large_image", title: "TTFL Store — Buy & Sell in Nigeria", description: "Shop products from vendors across Nigeria on TTFL Store.", images: ["/ttflstore.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

function MaintenancePage() {
  return <main className="min-h-screen bg-white px-6 py-16 text-graphite-900 dark:bg-graphite-950 dark:text-white"><div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center"><img src="/ttflstore.png" alt="TTFL Store" className="mb-8 h-24 w-24 rounded-2xl object-contain"/><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-graphite-200 bg-graphite-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-graphite-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-300"><span className="h-2 w-2 animate-pulse rounded-full bg-amber-500"/>Maintenance</div><h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Hi! TTFL Store is currently under maintenance.</h1><p className="mt-5 max-w-xl text-base leading-7 text-graphite-600 dark:text-graphite-300 sm:text-lg">All services are temporarily down while we work on the platform. Please come back later. Thank you for your patience.</p><p className="mt-8 text-sm font-semibold text-graphite-500 dark:text-graphite-400">— The Tron Forge Limited</p></div></main>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (MAINTENANCE_MODE) {
    return <html lang="en-NG" className={`${jakarta.variable} ${mono.variable}`}><body><MaintenancePage /></body></html>;
  }

  return <html lang="en-NG" className={`${jakarta.variable} ${mono.variable}`}><body><SiteStructuredData /><AuthProvider><CartProvider><AffiliateTracker /><SiteHeader /><main>{children}</main><SiteFooter /><BroadcastPopup /></CartProvider></AuthProvider></body></html>;
}
