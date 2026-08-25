"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

type AdminPayout = {
  id: string;
  amount: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  requestedAt: string;
  vendor: { storeName: string };
};

const TABS = ["PENDING", "APPROVED", "REJECTED", "PAID"] as const;

export default function AdminPayoutsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("PENDING");
  const [payouts, setPayouts] = useState<AdminPayout[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(status: (typeof TABS)[number]) {
    setPayouts(null);
    const { payouts } = await api.get<{ payouts: AdminPayout[] }>(`/api/payouts/admin?status=${status}`);
    setPayouts(payouts);
  }

  useEffect(() => {
    void load(tab);
  }, [tab]);

  async function approve(id: string) {
    setBusyId(id);
    await api.post(`/api/payouts/admin/${id}/approve`);
    await load(tab);
    setBusyId(null);
  }

  async function reject(id: string) {
    const note = prompt("Reason for rejecting this payout?");
    if (!note) return;
    setBusyId(id);
    await api.post(`/api/payouts/admin/${id}/reject`, { note });
    await load(tab);
    setBusyId(null);
  }

  async function markPaid(id: string) {
    if (!confirm("Confirm you've already sent this payment manually? This just records it as paid.")) return;
    setBusyId(id);
    await api.post(`/api/payouts/admin/${id}/mark-paid`);
    await load(tab);
    setBusyId(null);
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Vendor payouts</h1>
      <p className="mt-1 text-sm text-graphite-600">
        Marking "paid" is a record only — send the actual bank transfer yourself first.
      </p>

      <div className="mt-4 flex gap-1 border-b border-graphite-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t ? "border-ember-600 text-ember-600" : "border-transparent text-graphite-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {payouts === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : payouts.length === 0 ? (
        <p className="mt-6 text-sm text-graphite-600">Nothing here.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {payouts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-graphite-200 p-4">
              <div>
                <p className="font-mono text-sm font-semibold text-graphite-900">{formatNaira(Number(p.amount))}</p>
                <p className="text-xs text-graphite-600">{p.vendor.storeName}</p>
                <p className="text-xs text-graphite-400">
                  Requested {new Date(p.requestedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </p>
              </div>
              <div className="flex gap-2">
                {p.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => approve(p.id)}
                      disabled={busyId === p.id}
                      className="rounded-card bg-verified-600 px-3 py-2 text-sm font-semibold text-white hover:bg-verified-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(p.id)}
                      disabled={busyId === p.id}
                      className="rounded-card border border-graphite-300 px-3 py-2 text-sm font-semibold text-graphite-900 hover:bg-cloud-100 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                )}
                {p.status === "APPROVED" && (
                  <button
                    onClick={() => markPaid(p.id)}
                    disabled={busyId === p.id}
                    className="rounded-card bg-graphite-900 px-3 py-2 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
                  >
                    Mark as paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
