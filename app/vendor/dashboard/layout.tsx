import type { Metadata } from "next";
import { VendorDashboardBackButton } from "@/components/vendor-dashboard-back-button";

export const metadata: Metadata = {
  title: { default: "Vendor Dashboard", template: "%s | TTFL Vendor Dashboard" },
  description: "Manage your TTFL Store products, orders, analytics, payouts and storefront.",
  robots: { index: false, follow: false },
};

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="shell pt-6">
        <VendorDashboardBackButton />
      </div>
      {children}
    </>
  );
}
