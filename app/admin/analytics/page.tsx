"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ShieldCheck, UserCheck, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

type Overview = {
  users: { total: number };
  vendors: { total: number; approved: number };
  products: { total: number; active: number };
  orders: { total: number; paid: number; refunded: number };
  gmv: number;
  totalDiscountsGiven: number;
  ttflCommissionRevenue: number;
  vendorEarnings: number;
  subscriptionRevenue: number;
  featuredProductRevenue: number;
  featuredStoreRevenue: number;
  referralActivity: { whatsappLeads: number; externalClicks: number };
};

type CommissionCenter = {
  directSales: { totalSales: number; totalCommission: number; orderCount: number };
  referralTraffic: { type: string; count: number }[];
  subscriptions: { revenue: number; count: number };
  featuredProducts: { revenue: number; count: number };
  featuredStores: { revenue: number; count: number };
};

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

type UserStats = { total: number; verified: number; unverified: number };

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [commission, setCommission] = useState<CommissionCenter | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  async function loadUsers() {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const result = await api.get<{ stats: UserStats; users: AdminUser[] }>("/api/admin/users");
      setUserStats(result.stats);
      setUsers(result.users);
    } catch (error) {
      setUsersError(error instanceof ApiError ? error.message : "Could not load registered users.");
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    api.get<{ overview: Overview }>("/api/analytics/admin/overview").then((r) => setOverview(r.overview));
    api.get<CommissionCenter>("/api/analytics/admin/commission-center").then(setCommission);
  }, []);

  async function resendVerification(user: AdminUser) {
    setResendingId(user.id);
    setUserMessage(null);
    try {
      const result = await api.post<{ message: string }>(`/api/admin/users/${user.id}/resend-verification`, {});
      setUserMessage(result.message);
    } catch (error) {
      setUserMessage(error instanceof ApiError ? error.message : "Could not send a new verification link.");
    } finally {
      setResendingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => `${user.firstName} ${user.lastName} ${user.email} ${user.role}`.toLowerCase().includes(query));
  }, [search, users]);

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Analytics</h1>

      {overview && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Users" value={overview.users.total.toLocaleString()} />
          <Stat label="Vendors (approved)" value={`${overview.vendors.total} (${overview.vendors.approved})`} />
          <Stat label="Products (active)" value={`${overview.products.total} (${overview.products.active})`} />
          <Stat label="Orders (paid)" value={`${overview.orders.total} (${overview.orders.paid})`} />
          <Stat label="GMV" value={formatNaira(overview.gmv)} />
          <Stat label="TTFL commission revenue" value={formatNaira(overview.ttflCommissionRevenue)} />
          <Stat label="Vendor earnings paid out" value={formatNaira(overview.vendorEarnings)} />
          <Stat label="Discounts given" value={formatNaira(overview.totalDiscountsGiven)} />
          <Stat label="Subscription revenue" value={formatNaira(overview.subscriptionRevenue)} />
          <Stat label="Featured product revenue" value={formatNaira(overview.featuredProductRevenue)} />
          <Stat label="Featured store revenue" value={formatNaira(overview.featuredStoreRevenue)} />
          <Stat label="Refunded orders" value={overview.orders.refunded.toLocaleString()} />
          <Stat label="WhatsApp leads" value={overview.referralActivity.whatsappLeads.toLocaleString()} />
          <Stat label="External link clicks" value={overview.referralActivity.externalClicks.toLocaleString()} />
        </div>
      )}

      <section className="mt-8 rounded-card border border-graphite-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-cloud-100 text-graphite-700"><Users className="h-5 w-5" /></span>
            <div>
              <h2 className="font-bold text-graphite-900">Registered users</h2>
              <p className="mt-0.5 text-sm text-graphite-600">Monitor account registration and email verification status.</p>
            </div>
          </div>
          <button onClick={() => void loadUsers()} disabled={usersLoading} className="inline-flex items-center justify-center gap-2 rounded-card border border-graphite-200 px-3 py-2 text-sm font-semibold text-graphite-800 hover:border-ember-600 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {userStats && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <UserStat icon={Users} label="All registered" value={userStats.total} />
            <UserStat icon={UserCheck} label="Verified" value={userStats.verified} />
            <UserStat icon={ShieldCheck} label="Unverified" value={userStats.unverified} />
          </div>
        )}

        {userMessage && <p className="mt-4 rounded-card bg-cloud-100 px-3 py-2 text-sm text-graphite-700">{userMessage}</p>}
        {usersError && <p className="mt-4 rounded-card bg-ember-100 px-3 py-2 text-sm text-ember-700">{usersError}</p>}

        <div className="mt-5 flex items-center gap-2 rounded-card border border-graphite-200 px-3 py-2">
          <Search className="h-4 w-4 text-graphite-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users by name, email, or role" className="min-w-0 flex-1 bg-transparent text-sm text-graphite-900 outline-none" />
        </div>

        <div className="mt-4 overflow-x-auto rounded-card border border-graphite-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cloud-100 text-xs uppercase tracking-wide text-graphite-600">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Email status</th>
                <th className="px-4 py-3 font-semibold">Registered</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="align-middle">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-graphite-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-graphite-600">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-graphite-700">{user.role}</td>
                  <td className="px-4 py-3">
                    {user.emailVerified ? (
                      <span className="inline-flex rounded-[4px] bg-verified-100 px-2 py-1 text-xs font-semibold text-verified-700">Verified</span>
                    ) : (
                      <span className="inline-flex rounded-[4px] bg-ember-100 px-2 py-1 text-xs font-semibold text-ember-700">Unverified</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-graphite-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {!user.emailVerified && (
                      <button onClick={() => void resendVerification(user)} disabled={resendingId === user.id} className="inline-flex items-center gap-2 rounded-card bg-ember-600 px-3 py-2 text-xs font-semibold text-white hover:bg-ember-700 disabled:opacity-60">
                        <RefreshCw className={`h-3.5 w-3.5 ${resendingId === user.id ? "animate-spin" : ""}`} />
                        {resendingId === user.id ? "Sending..." : "Reverify user"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!usersLoading && filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-graphite-600">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-graphite-600">Commission center</h2>
      {commission && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Direct sales</p>
            <p className="font-mono text-lg font-bold text-graphite-900">{formatNaira(commission.directSales.totalSales)}</p>
            <p className="text-xs text-graphite-600">Commission: {formatNaira(commission.directSales.totalCommission)} · {commission.directSales.orderCount} orders</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Subscriptions</p>
            <p className="font-mono text-lg font-bold text-graphite-900">{formatNaira(commission.subscriptions.revenue)}</p>
            <p className="text-xs text-graphite-600">{commission.subscriptions.count} payments</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Featured products</p>
            <p className="font-mono text-lg font-bold text-graphite-900">{formatNaira(commission.featuredProducts.revenue)}</p>
            <p className="text-xs text-graphite-600">{commission.featuredProducts.count} listings</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Featured stores</p>
            <p className="font-mono text-lg font-bold text-graphite-900">{formatNaira(commission.featuredStores.revenue)}</p>
            <p className="text-xs text-graphite-600">{commission.featuredStores.count} listings</p>
          </div>
          <div className="rounded-card border border-graphite-200 p-4">
            <p className="text-xs text-graphite-600">Referral traffic</p>
            {commission.referralTraffic.map((r) => <p key={r.type} className="text-xs text-graphite-700">{r.type.replace(/_/g, " ").toLowerCase()}: {r.count}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-card border border-graphite-200 p-4"><p className="text-xs text-graphite-600">{label}</p><p className="mt-0.5 font-mono text-base font-bold text-graphite-900">{value}</p></div>;
}

function UserStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return <div className="rounded-card border border-graphite-200 p-4"><div className="flex items-center gap-2 text-graphite-600"><Icon className="h-4 w-4" /><span className="text-xs">{label}</span></div><p className="mt-1 text-2xl font-bold text-graphite-900">{value.toLocaleString()}</p></div>;
}
