import Link from "next/link";
import { ShieldCheck, Truck, Wallet } from "lucide-react";

const trustPoints = [
  { icon: ShieldCheck, label: "Verified vendors" },
  { icon: Wallet, label: "Secure Paystack checkout" },
  { icon: Truck, label: "Tracked delivery" },
];

export function Hero() {
  return (
    <section className="border-b border-graphite-200 bg-graphite-950">
      <div className="shell grid gap-5 py-7 sm:gap-8 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <div>
          <span className="inline-flex items-center rounded-tag bg-ember-600/15 px-2 py-0.5 font-mono text-[9px] font-medium tracking-wide text-ember-500 sm:px-2.5 sm:py-1 sm:text-[11px]">
            THE OFFICIAL TTFL MARKETPLACE
          </span>
          <h1 className="mt-2.5 max-w-lg text-2xl font-bold leading-tight tracking-tight text-white sm:mt-4 sm:text-4xl lg:text-[42px]">
            Buy it, sell it — with vendors you can trust.
          </h1>
          <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-graphite-400 sm:mt-4 sm:text-[15px]">
            Thousands of listings from verified stores across Nigeria. Checkout
            on TTFL, message on WhatsApp, or shop direct with the vendor —
            your call.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
            <Link
              href="/shop"
              className="rounded-card bg-ember-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-ember-700 sm:px-5 sm:py-3 sm:text-sm"
            >
              Start shopping
            </Link>
            <Link
              href="/sell"
              className="rounded-card border border-graphite-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-graphite-900 sm:px-5 sm:py-3 sm:text-sm"
            >
              Sell on TTFL Store
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 sm:mt-8 sm:gap-x-6 sm:gap-y-3">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-graphite-400 sm:gap-2 sm:text-[13px]">
                <Icon className="h-3.5 w-3.5 text-graphite-200 sm:h-4 sm:w-4" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {[
            { label: "Flash Deals", sub: "Up to 40% off", tone: "bg-ember-600" },
            { label: "New Arrivals", sub: "This week", tone: "bg-graphite-800" },
            { label: "Verified Stores", sub: "1,200+ vendors", tone: "bg-graphite-800" },
            { label: "Near You", sub: "Local pickup", tone: "bg-verified-700" },
          ].map((t) => (
            <div
              key={t.label}
              className={`${t.tone} flex h-24 flex-col justify-between rounded-card p-3 text-white sm:h-36 sm:p-4`}
            >
              <span className="text-[11px] font-medium text-white/70 sm:text-[13px]">{t.sub}</span>
              <span className="text-base font-bold tracking-tight sm:text-lg">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
