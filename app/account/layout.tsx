import type { Metadata } from "next";

const accountPreview = "https://ttflstore.name.ng/ttflstore-myaccount.png";

export const metadata: Metadata = {
  title: "My Account | TTFL Store",
  description: "Manage your TTFL Store account, orders, addresses, wishlist, and profile settings.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://ttflstore.name.ng/account",
  },
  openGraph: {
    title: "My Account | TTFL Store",
    description: "Manage your TTFL Store account, orders, addresses, wishlist, and profile settings.",
    url: "https://ttflstore.name.ng/account",
    siteName: "TTFL Store",
    type: "website",
    images: [{ url: accountPreview, width: 1200, height: 630, alt: "TTFL Store My Account" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Account | TTFL Store",
    description: "Manage your TTFL Store account, orders, addresses, wishlist, and profile settings.",
    images: [accountPreview],
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
