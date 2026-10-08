"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LockKeyhole, Paintbrush } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function StoreBuilderEntry({ storeSlug }: { storeSlug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [membership, setMembership] = useState<{ vendorId: string; isOwner: boolean } | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      if (authLoading) return;
      if (!user) {
        if (active) setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const { membership: nextMembership } = await api.get<{ membership: { vendorId: string; isOwner: boolean } | null }>("/api/vendor-staff/me");
        if (!active) return;
        setMembership(nextMembership);

        if (nextMembership?.isOwner) {
          const access = await api.get<{ allowed: boolean }>("/api/store-builder/access");
          if (active) setAllowed(Boolean(access.allowed));
        }
      } catch {
        if (active) {
          setMembership(null);
          setAllowed(false);
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    void checkAccess();
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  if (checking || !user || !membership?.isOwner) return null;

  const href = `/vendor/dashboard/store-builder?store=${encodeURIComponent(storeSlug)}`;

  if (allowed) {
    return (
      <Link href={href} className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2.5 text-xs font-bold text-graphite-900 shadow-lg hover:bg-white">
        <Paintbrush className="h-4 w-4 text-ember-600" />
        Customize Store
      </Link>
    );
  }

  return (
    <Link href="/vendor/dashboard/subscription" className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2.5 text-xs font-bold text-graphite-900 shadow-lg hover:bg-white" title="Store Builder requires a qualifying paid vendor plan or active vendor referral reward.">
      <LockKeyhole className="h-4 w-4 text-ember-600" />
      Unlock Store Builder
    </Link>
  );
}
