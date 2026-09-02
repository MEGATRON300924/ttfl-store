import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AffiliateTracker } from "@/components/affiliate-tracker";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ttflstore.name.ng"),
  title: { default: "TTFL Store — The Tron Forge Limited Marketplace", template: "%s | TTFL Store" },
  description: "Buy and sell with verified vendors on TTFL Store, the official marketplace of The Tron Forge Limited.",
  openGraph: { type: "website", siteName: "TTFL Store", title: "TTFL Store — The Tron Forge Limited Marketplace", description: "Buy and sell with verified vendors on TTFL Store, the official marketplace of The Tron Forge Limited." },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <AffiliateTracker />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
