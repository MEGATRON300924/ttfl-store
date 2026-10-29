"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

const EVENT_START = new Date("2026-11-23T00:00:00+01:00").getTime();

type Remaining = { days: number; hours: number; minutes: number; seconds: number };
function getRemaining(now: number): Remaining {
  const total = Math.max(0, EVENT_START - now);
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total % 86_400_000) / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1_000),
  };
}

export function BlackFridayCountdown() {
  const [remaining, setRemaining] = useState<Remaining>(() => getRemaining(Date.now()));
  const [started, setStarted] = useState(() => Date.now() >= EVENT_START);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      setRemaining(getRemaining(now));
      setStarted(now >= EVENT_START);
    };
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const units: { label: string; value: number }[] = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Minutes", value: remaining.minutes },
    { label: "Seconds", value: remaining.seconds },
  ];

  return (
    <section aria-label="Black Friday Week countdown" className="mt-8 max-w-2xl rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-sm sm:p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-ember-300">
        {started ? <CalendarDays className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
        {started ? "Black Friday Week has started" : "The countdown is on"}
      </div>
      {started ? (
        <p className="mt-3 text-lg font-extrabold text-white">Black Friday Week runs from November 23–30, 2026.</p>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-live="off">
          {units.map((unit) => (
            <div key={unit.label} className="rounded-xl border border-white/10 bg-black/25 px-1 py-3 text-center sm:px-3 sm:py-4">
              <div className="text-2xl font-extrabold tabular-nums tracking-tight text-white sm:text-4xl">{String(unit.value).padStart(2, "0")}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-graphite-300 sm:text-xs">{unit.label}</div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-graphite-300">Countdown is shown in real time. Event dates use West Africa Time (WAT).</p>
    </section>
  );
}
