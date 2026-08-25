"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiVendorBalance, ApiPayout } from "@/lib/api-types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gold-100 text-gold-600",
  APPROVED: "bg-verified-100 text-verified-700",
  REJECTED: "bg-ember-100 text-ember-700",
  PAID: "bg-cloud-100 text-graphite-700",
};

export default function VendorPayoutsPage() {
  const [balance, setBalance] = useState<ApiVendorBalance | null>(null);
  const [payouts, setPayouts] = useState<ApiPayout[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  async function load() {
    const [balanceRes, payoutsRes] = await Promise.all([
      api.get<{ balance: ApiVendorBalance }>("/api/payouts/me/balance"),
      api.get<{ payouts: ApiPayout[] }>("/api/payouts/me"),
    ]);
    setBalance(balanceRes.balance);
    setPayouts(payoutsRes.payouts);
  }

  useEffect(() => {
    void load();
  }, []);

  async function requestPayout() {
    setError(null);
    setRequesting(true);
    try {
      await api.post("/api/payouts/me/request");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't request a payout");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Payouts</h1>

      {balance && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Available balance</p>
            <p className="font-mono text-xl font-bold text-graphite-900">{formatNaira(balance.availableBalance)}</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Total earnings</p>
            <p className="font-mono text-xl font-bold text-graphite-900">{formatNaira(balance.totalEarnings)}</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Already paid out</p>
            <p className="font-mono text-xl font-bold text-graphite-900">{formatNaira(balance.paidOut)}</p>
          </div>
        </div>
      )}

      {error && <p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      <button
        onClick={requestPayout}
        disabled={requesting || !balance || balance.availableBalance <= 0}
        className="mt-4 rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
      >
        {requesting ? "Requesting…" : "Request payout"}
      </button>

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-graphite-600">Payout history</h2>
      {payouts === null ? (
        <p className="text-sm text-graphite-600">Loading…</p>
      ) : payouts.length === 0 ? (
        <p className="text-sm text-graphite-600">No payouts requested yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-card border border-graphite-200 p-3">
              <div>
                <p className="font-mono text-sm font-semibold text-graphite-900">{formatNaira(Number(p.amount))}</p>
                <p className="text-xs text-graphite-400">
                  Requested {new Date(p.requestedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </p>
              </div>
              <span className={`rounded-tag px-2 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                {p.status.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
