"use client";

import { useEffect, useState } from "react";

export function DeliveryEstimate({ days = 7, orderedAt }: { days?: number; orderedAt?: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer); }, []);
  const base = orderedAt ? new Date(orderedAt) : now;
  const date = new Date(base.getTime() + days * 86400000);
  return <div className="rounded-card border border-graphite-200 bg-cloud-100 px-3 py-2.5"><p className="text-[11px] font-semibold uppercase tracking-wide text-graphite-500">Estimated delivery</p><p className="mt-0.5 text-sm font-bold text-graphite-900">{date.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><p className="mt-0.5 text-[11px] text-graphite-500">Based on {days} day{days === 1 ? "" : "s"} delivery time</p></div>;
}
