"use client";

import { useState } from "react";
import { BadgeCheck, Building2, Crown, Gem, X } from "lucide-react";

export type StoreBadge = "VERIFIED" | "BUSINESS" | "ENTERPRISE" | "PLATINUM";

type BadgeConfig = {
  label: string;
  message: string;
  icon: typeof BadgeCheck;
  className: string;
};

const BADGES: Record<StoreBadge, BadgeConfig> = {
  VERIFIED: {
    label: "Verified Store",
    message: "This store is verified by TTFL Store. Its identity and store information have been reviewed and verified.",
    icon: BadgeCheck,
    className: "border-verified-100 bg-verified-100 text-verified-700",
  },
  BUSINESS: {
    label: "Business Store",
    message: "This store has a Business Store badge on TTFL Store, recognizing it as an established business seller.",
    icon: Building2,
    className: "border-graphite-200 bg-cloud-100 text-graphite-700",
  },
  ENTERPRISE: {
    label: "Enterprise Store",
    message: "This store has an Enterprise Store badge on TTFL Store and has access to our advanced storefront features.",
    icon: Building2,
    className: "border-ember-100 bg-ember-100 text-ember-700",
  },
  PLATINUM: {
    label: "Platinum",
    message: "This store has a Platinum badge on TTFL Store, recognizing its premium seller status.",
    icon: Crown,
    className: "border-gold-100 bg-gold-100 text-gold-600",
  },
};

export function StoreBadges({ badges }: { badges: StoreBadge[] }) {
  const [selected, setSelected] = useState<StoreBadge | null>(null);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {badges.map((badge) => {
          const config = BADGES[badge];
          if (!config) return null;
          const Icon = config.icon === Crown ? Gem : config.icon;
          return (
            <button
              key={badge}
              type="button"
              title={config.label}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelected(badge);
              }}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition hover:brightness-95 ${config.className}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-graphite-950/50 p-4" onClick={() => setSelected(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="store-badge-title" className="w-full max-w-sm rounded-card border border-graphite-200 bg-white p-5 shadow-card" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`grid h-10 w-10 place-items-center rounded-full ${BADGES[selected].className}`}>
                  {(() => {
                    const Icon = BADGES[selected].icon === Crown ? Gem : BADGES[selected].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <h2 id="store-badge-title" className="text-base font-bold text-graphite-900">{BADGES[selected].label}</h2>
                  <p className="mt-0.5 text-xs font-medium text-graphite-500">TTFL Store badge</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="rounded-full p-1.5 text-graphite-500 hover:bg-cloud-100 hover:text-graphite-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-5 text-sm leading-6 text-graphite-600">{BADGES[selected].message}</p>
            <button type="button" onClick={() => setSelected(null)} className="mt-5 w-full rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800">Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
