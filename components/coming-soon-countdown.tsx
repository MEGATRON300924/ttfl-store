"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const difference = new Date(target).getTime() - Date.now();
  if (!Number.isFinite(difference) || difference <= 0) return null;
  const totalSeconds = Math.floor(difference / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function ComingSoonCountdown({ availableAt, className = "" }: { availableAt?: string | null; className?: string }) {
  const [remaining, setRemaining] = useState(() => (availableAt ? getRemaining(availableAt) : null));

  useEffect(() => {
    if (!availableAt) {
      setRemaining(null);
      return;
    }
    const update = () => setRemaining(getRemaining(availableAt));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [availableAt]);

  if (!remaining) return <span className={className}>Launching soon</span>;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`} aria-label="Time until launch">
      <span className="font-semibold">Launches in</span>
      <span>{remaining.days}d</span>
      <span>{String(remaining.hours).padStart(2, "0")}h</span>
      <span>{String(remaining.minutes).padStart(2, "0")}m</span>
      <span>{String(remaining.seconds).padStart(2, "0")}s</span>
    </span>
  );
}
