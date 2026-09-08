"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBackButton = pathname !== "/admin";

  return (
    <>
      {showBackButton && (
        <div className="shell pt-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-card border border-graphite-200 bg-white px-3 py-2 text-sm font-semibold text-graphite-700 transition hover:border-ember-600 hover:text-ember-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      )}
      {children}
    </>
  );
}
