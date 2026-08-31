```tsx
"use client";

import Link from "next/link";
import {
  Users,
  Package,
  BarChart3,
  Wallet,
  Ticket,
  Megaphone,
  Layers,
  MessageCircle,
  Settings,
  FileText,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  {
    href: "/admin/vendors",
    icon: Users,
    title: "Vendor applications",
    desc: "Approve, reject, or suspend vendors",
  },
  {
    href: "/admin/products",
    icon: Package,
    title: "Product moderation",
    desc: "Suspend or reinstate listings",
  },
  {
    href: "/admin/orders",
    icon: ShoppingBag,
    title: "Orders & refunds",
    desc: "View orders, issue Paystack refunds",
  },
  {
    href: "/admin/analytics",
    icon: BarChart3,
    title: "Analytics",
    desc: "Platform-wide stats and commission center",
  },
  {
    href: "/admin/plans",
    icon: Layers,
    title: "Vendor plans",
    desc: "Edit tier pricing, limits, commission",
  },
  {
    href: "/admin/categories",
    icon: Layers,
    title: "Categories",
    desc: "Create categories so vendors can list products",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    title: "Platform settings",
    desc: "Featured pricing, minimum payout amount",
  },
  {
    href: "/admin/payouts",
    icon: Wallet,
    title: "Payouts",
    desc: "Review and approve vendor withdrawal requests",
  },
  {
    href: "/admin/coupons",
    icon: Ticket,
    title: "Coupons",
    desc: "Platform-wide discount codes",
  },
  {
    href: "/admin/featured",
    icon: Megaphone,
    title: "Featured listings",
    desc: "Active paid promotions",
  },
  {
    href: "/admin/support",
    icon: MessageCircle,
    title: "Support inbox",
    desc: "Customer conversations",
  },
  {
    href: "/admin/audit-logs",
    icon: FileText,
    title: "Audit logs",
    desc: "Sensitive admin action history",
  },
  {
    href: "/admin/email-logs",
    icon: Mail,
    title: "Email logs",
    desc: "Delivery status for queued emails",
  },
];

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="shell py-16 text-center">
        <p className="text-sm text-graphite-600">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">
          Admin access only
        </h1>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Admin</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-card border border-graphite-200 p-5 hover:border-ember-600"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700">
              <Icon className="h-5 w-5" />
            </span>

            <div>
              <p className="font-semibold text-graphite-900">{title}</p>
              <p className="text-sm text-graphite-600">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```
