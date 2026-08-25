"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import type { VendorStatus } from "@/lib/api-types";

type Application = {
  id: string;
  storeName: string;
  storeSlug: string;
  status: VendorStatus;
  tier: string;
  appliedAt: string;
  user: { firstName: string; lastName: string; email: string };
};

const TABS: { label: string; value: VendorStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
];

export default function AdminVendorsPage() {
  const [tab, setTab] = useState<VendorStatus>("PENDING");
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(status: VendorStatus) {
    setApplications(null);
    const { applications } = await api.get<{ applications: Application[] }>(
      `/api/vendors/admin/applications?status=${status}`
    );
    setApplications(applications);
  }

  useEffect(() => {
    void load(tab);
  }, [tab]);

  async function approve(id: string) {
    setBusyId(id);
    await api.post(`/api/vendors/admin/${id}/approve`);
    await load(tab);
    setBusyId(null);
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;
    setBusyId(id);
    await api.post(`/api/vendors/admin/${id}/reject`, { reason });
    await load(tab);
    setBusyId(null);
  }

  async function suspend(id: string) {
    if (!confirm("Suspend this vendor? Their store and products go offline.")) return;
    setBusyId(id);
    await api.post(`/api/vendors/admin/${id}/suspend`);
    await load(tab);
    setBusyId(null);
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Vendor applications</h1>

      <div className="mt-4 flex gap-1 border-b border-graphite-200">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.value ? "border-ember-600 text-ember-600" : "border-transparent text-graphite-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {applications === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : applications.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">
          Nothing here.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {applications.map((app) => (
            <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-graphite-200 p-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-graphite-900">{app.storeName}</p>
                  {app.status === "APPROVED" && <BadgeCheck className="h-4 w-4 text-verified-600" />}
                </div>
                <p className="text-sm text-graphite-600">
                  {app.user.firstName} {app.user.lastName} · {app.user.email}
                </p>
                <p className="text-xs text-graphite-400">
                  Applied {new Date(app.appliedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} · {app.tier} tier
                </p>
              </div>

              <div className="flex gap-2">
                {app.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => approve(app.id)}
                      disabled={busyId === app.id}
                      className="rounded-card bg-verified-600 px-3 py-2 text-sm font-semibold text-white hover:bg-verified-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(app.id)}
                      disabled={busyId === app.id}
                      className="rounded-card border border-graphite-300 px-3 py-2 text-sm font-semibold text-graphite-900 hover:bg-cloud-100 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                )}
                {app.status === "APPROVED" && (
                  <button
                    onClick={() => suspend(app.id)}
                    disabled={busyId === app.id}
                    className="rounded-card border border-ember-600 px-3 py-2 text-sm font-semibold text-ember-600 hover:bg-ember-100 disabled:opacity-60"
                  >
                    Suspend
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
