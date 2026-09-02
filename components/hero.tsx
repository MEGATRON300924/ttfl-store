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
      <div className="shell grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <div>
          <span className="inline-flex items-center rounded-tag bg-ember-600/15 px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide text-ember-500">
            THE OFFICIAL TTFL MARKETPLACE
          </span>
          <h1 className="mt-4 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
            Buy it, sell it — with vendors you can trust.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-graphite-400">
            Thousands of listings from verified stores across Nigeria. Checkout
            on TTFL, message on WhatsApp, or shop direct with the vendor —
            your call.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-card bg-ember-600 px-5 py-3 text-sm font-semibold text-white hover:bg-ember-700"
            >
              Start shopping
            </Link>
            <Link
              href="/sell"
              className="rounded-card border border-graphite-700 px-5 py-3 text-sm font-semibold text-white hover:bg-graphite-900"
            >
              Sell on TTFL Store
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[13px] text-graphite-400">
                <Icon className="h-4 w-4 text-graphite-200" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Flash Deals", sub: "Up to 40% off", tone: "bg-ember-600" },
            { label: "New Arrivals", sub: "This week", tone: "bg-graphite-800" },
            { label: "Verified Stores", sub: "1,200+ vendors", tone: "bg-graphite-800" },
            { label: "Near You", sub: "Local pickup", tone: "bg-verified-700" },
          ].map((t) => (
            <div
              key={t.label}
              className={`${t.tone} flex h-32 flex-col justify-between rounded-card p-4 text-white sm:h-36`}
            >
              <span className="text-[13px] font-medium text-white/70">{t.sub}</span>
              <span className="text-lg font-bold tracking-tight">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
