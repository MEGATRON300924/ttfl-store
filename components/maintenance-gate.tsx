"use client";

import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-cloud-50 px-6 dark:bg-graphite-950">
        <div className="text-center">
          <Image src="/ttflstore.png" alt="TTFL Store" width={64} height={64} className="mx-auto h-16 w-16 rounded-2xl" priority />
          <p className="mt-4 text-sm font-semibold text-graphite-600 dark:text-graphite-300">Checking access…</p>
        </div>
      </main>
    );
  }

  if (user?.role === "ADMIN") return <>{children}</>;

  return (
    <main className="grid min-h-screen place-items-center bg-cloud-50 px-6 py-16 dark:bg-graphite-950">
      <div className="w-full max-w-md text-center">
        <Image src="/ttflstore.png" alt="TTFL Store" width={88} height={88} className="mx-auto h-22 w-22 rounded-3xl shadow-sm" priority />
        <h1 className="mt-7 text-2xl font-extrabold tracking-tight text-graphite-950 dark:text-white">Hi! 👋</h1>
        <p className="mt-3 text-base font-semibold leading-7 text-graphite-700 dark:text-graphite-200">
          TTFL Store is currently under maintenance.
        </p>
        <p className="mt-1 text-sm leading-6 text-graphite-600 dark:text-graphite-400">
          All services are temporarily down. Please come back later. Thank you for your patience.
        </p>
      </div>
    </main>
  );
}
