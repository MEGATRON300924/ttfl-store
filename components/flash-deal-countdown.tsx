"use client";

import { useEffect, useState } from "react";

function remaining(target: string) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const total = Math.floor(ms / 1000);
  return { days: Math.floor(total / 86400), hours: Math.floor((total % 86400) / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60, done: ms <= 0 };
}

export function FlashDealCountdown({ endsAt }: { endsAt: string }) {
  const [time, setTime] = useState(() => remaining(endsAt));
  useEffect(() => { const timer = window.setInterval(() => setTime(remaining(endsAt)), 1000); return () => window.clearInterval(timer); }, [endsAt]);
  if (time.done) return <span className="font-semibold text-graphite-500">Ended</span>;
  const parts = time.days > 0 ? [`${time.days}d`, `${String(time.hours).padStart(2, "0")}h`, `${String(time.minutes).padStart(2, "0")}m`] : [`${String(time.hours).padStart(2, "0")}h`, `${String(time.minutes).padStart(2, "0")}m`, `${String(time.seconds).padStart(2, "0")}s`];
  return <span className="font-mono font-semibold text-ember-700" aria-label={`Deal ends in ${parts.join(" ")}`}>{parts.join(" ")}</span>;
}
