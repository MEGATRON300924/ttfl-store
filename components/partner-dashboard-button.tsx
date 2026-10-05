"use client";

import Link from "next/link";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function PartnerDashboardButton() {
  const { user, loading } = useAuth();
  const href = !loading && !user
    ? "/login?next=/partners/dashboard"
    : "/partners/dashboard";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-ember-700"
    >
      <LayoutDashboard className="h-4 w-4" />
      Partner Dashboard
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
