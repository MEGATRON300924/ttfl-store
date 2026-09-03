import { BadgeCheck, Building2, Crown, Gem } from "lucide-react";

export type StoreBadge = "VERIFIED" | "BUSINESS" | "ENTERPRISE" | "PLATINUM";

const BADGES: Record<StoreBadge, { label: string; icon: typeof BadgeCheck; className: string }> = {
  VERIFIED: { label: "Verified Store", icon: BadgeCheck, className: "border-verified-100 bg-verified-100 text-verified-700" },
  BUSINESS: { label: "Business Store", icon: Building2, className: "border-graphite-200 bg-cloud-100 text-graphite-700" },
  ENTERPRISE: { label: "Enterprise Store", icon: Building2, className: "border-ember-100 bg-ember-100 text-ember-700" },
  PLATINUM: { label: "Platinum", icon: Crown, className: "border-gold-100 bg-gold-100 text-gold-600" },
};

export function StoreBadges({ badges }: { badges: StoreBadge[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((badge) => {
        const config = BADGES[badge];
        const Icon = config.icon === Crown ? Gem : config.icon;
        return (
          <span key={badge} title={config.label} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${config.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
