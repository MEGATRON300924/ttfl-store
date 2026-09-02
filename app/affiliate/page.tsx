"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Link2, Megaphone, Wallet } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export default function AffiliatePage() {
  const { user, loading } = useAuth();
  const [rate, setRate] = useState(5);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ program: { commissionRate: number } }>("/api/affiliates/program")
      .then(({ program }) => setRate(program.commissionRate))
      .catch(() => undefined);
  }, []);

  async function join() {
    if (!user) {
      window.location.href = "/login?next=/affiliate";
      return;
    }
    setJoining(true);
    setError(null);
    try {
      await api.post("/api/affiliates/join");
      setJoined(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't create your affiliate account.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="shell py-10 sm:py-14">
      <section className="rounded-card border border-graphite-200 bg-white p-7 sm:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-[4px] bg-ember-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-ember-700">TTFL Store Affiliate Program</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-graphite-900 sm:text-5xl">Share TTFL Store. Earn when people buy.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-graphite-600 sm:text-lg">Get your personal referral link, share it with your audience, and earn a commission on qualifying paid orders.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button onClick={join} disabled={joining || joined} className="inline-flex items-center justify-center gap-2 rounded-card bg-ember-600 px-5 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">
              {joined ? "Affiliate account created" : joining ? "Setting up…" : user ? "Join the affiliate program" : "Log in to join"}
              {!joined && <ArrowRight className="h-4 w-4" />}
            </button>
            <Link href="/affiliate/dashboard" className="inline-flex items-center justify-center rounded-card border border-graphite-300 px-5 py-3 text-sm font-semibold text-graphite-900 hover:bg-cloud-100">Affiliate dashboard</Link>
          </div>
          {error && <p className="mt-3 text-sm text-ember-700">{error}</p>}
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <Info icon={<Wallet />} title={`${rate}% commission`} text="Earn on qualifying paid orders attributed to your link." />
        <Info icon={<Link2 />} title="One simple link" text="Share your referral link on social media, chats, videos, or your website." />
        <Info icon={<BarChart3 />} title="Live stats" text="Track clicks, conversions, pending earnings, and paid earnings." />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold text-graphite-900">How it works</h2>
          <div className="mt-5 space-y-5">
            <Step n="01" title="Create your account" text="Join with your existing TTFL Store account." />
            <Step n="02" title="Get your referral link" text="Your dashboard gives you a unique affiliate code and shareable link." />
            <Step n="03" title="Share TTFL Store" text="Send your link to people who may want to shop on the marketplace." />
            <Step n="04" title="Earn" text={`When a referred customer completes a qualifying paid order, you earn ${rate}%.`} />
          </div>
        </div>
        <div className="rounded-card border border-graphite-200 bg-cloud-100 p-6">
          <Megaphone className="h-7 w-7 text-ember-600" />
          <h2 className="mt-4 text-xl font-bold text-graphite-900">Built for creators and communities</h2>
          <p className="mt-2 text-sm leading-6 text-graphite-600">Whether you have a social audience, a WhatsApp community, a YouTube channel, or simply friends who shop online, you can use your TTFL Store link to refer buyers.</p>
          <ul className="mt-5 space-y-3 text-sm text-graphite-700">
            {['30-day referral attribution', 'Real-time click tracking', 'Order-level commission history', 'Transparent pending and paid earnings'].map((item) => (
              <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-verified-600" />{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-card border border-graphite-200 bg-white p-5"><div className="text-ember-600">{icon}</div><h3 className="mt-4 text-sm font-bold text-graphite-900">{title}</h3><p className="mt-1.5 text-sm leading-6 text-graphite-600">{text}</p></div>;
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return <div className="flex gap-4"><span className="font-mono text-xs font-medium text-ember-600">{n}</span><div><h3 className="text-sm font-bold text-graphite-900">{title}</h3><p className="mt-1 text-sm leading-6 text-graphite-600">{text}</p></div></div>;
}
