import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AffiliateTracker } from "@/components/affiliate-tracker";
import { BroadcastPopup } from "@/components/broadcast-popup";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { SiteStructuredData } from "@/components/site-structured-data";
import { SiteLoadingScreen } from "@/components/site-loading-screen";
import { WaitlistLaunchAlert } from "@/components/my-waitlist";

const SITE_URL = "https://ttflstore.name.ng";
const ADSENSE_CLIENT = "ca-pub-2236157159704579";
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
  other: {
    "google-adsense-account": ADSENSE_CLIENT,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${jakarta.variable} ${mono.variable}`}>
      <body>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
        <SiteLoadingScreen />
        <SiteStructuredData />
        <AuthProvider>
          <CartProvider>
            <AffiliateTracker />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
            <BroadcastPopup />
            <WaitlistLaunchAlert />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
