import type { Metadata } from "next";
import AdminNavigationShell from "@/components/admin-navigation-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage TTFL Store users, vendors, products, orders, payouts, events, support, rewards, analytics, and settings.",
  robots: { index: false, follow: false },
  alternates: { canonical: `https://ttflstore.name.ng/admin` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminNavigationShell>{children}</AdminNavigationShell>;
}
