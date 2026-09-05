"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiPaystackAccount, ApiVendorBalance } from "@/lib/api-types";

export default function VendorPayoutsPage() {
  const [balance, setBalance] = useState<ApiVendorBalance | null>(null);
  const [account, setAccount] = useState<ApiPaystackAccount | null>(null);
  const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [balanceRes, accountRes, banksRes] = await Promise.all([
        api.get<{ balance: ApiVendorBalance }>("/api/payouts/me/balance"),
        api.get<{ account: ApiPaystackAccount }>("/api/payouts/me/account"),
        api.get<{ banks: Array<{ code: string; name: string }> }>("/api/payouts/banks"),
      ]);
      setBalance(balanceRes.balance);
      setAccount(accountRes.account);
      setBanks(banksRes.banks);
      if (accountRes.account.bankName) {
        const match = banksRes.banks.find((bank) => bank.name === accountRes.account.bankName);
        if (match) setBankCode(match.code);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load payout settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveAccount(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const result = await api.put<{ account: ApiPaystackAccount }>("/api/payouts/me/account", { bankCode, accountNumber });
      setAccount(result.account);
      setAccountNumber("");
      setMessage(result.account.verified ? "Your payout account is ready." : "Your payout account was saved. Paystack may require verification before the first settlement.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save payout account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="shell py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">Vendor finance</p>
        <h1 className="mt-1 text-2xl font-bold text-graphite-900">Payouts</h1>
        <p className="mt-2 text-sm leading-6 text-graphite-600">TTFL Store uses Paystack split payments. Your commission is deducted at checkout and your vendor share is sent to your connected bank account automatically.</p>

        {balance && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-card border border-graphite-200 bg-white p-4"><p className="text-xs text-graphite-600">Sales</p><p className="mt-1 font-mono text-xl font-bold text-graphite-900">{formatNaira(balance.grossSales)}</p></div>
            <div className="rounded-card border border-graphite-200 bg-white p-4"><p className="text-xs text-graphite-600">Your earnings</p><p className="mt-1 font-mono text-xl font-bold text-graphite-900">{formatNaira(balance.totalEarnings)}</p></div>
            <div className="rounded-card border border-graphite-200 bg-white p-4"><p className="text-xs text-graphite-600">Settlement pending</p><p className="mt-1 font-mono text-xl font-bold text-graphite-900">{formatNaira(balance.settlementPending)}</p></div>
          </div>
        )}

        {error && <p className="mt-4 rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
        {message && <p className="mt-4 rounded-[7px] bg-verified-100 px-3 py-2 text-sm text-verified-700">{message}</p>}

        <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="font-bold text-graphite-900">Settlement account</h2><p className="mt-1 text-sm text-graphite-600">This is the bank account Paystack uses for your store's settlements.</p></div>
            {account?.configured && <span className="rounded-tag bg-verified-100 px-2 py-1 text-xs font-semibold text-verified-700">Connected</span>}
          </div>

          {account?.configured && (
            <div className="mt-4 grid gap-3 rounded-card bg-cloud-50 p-4 sm:grid-cols-3">
              <div><p className="text-xs text-graphite-500">Account name</p><p className="mt-1 text-sm font-semibold text-graphite-900">{account.accountName ?? "—"}</p></div>
              <div><p className="text-xs text-graphite-500">Bank</p><p className="mt-1 text-sm font-semibold text-graphite-900">{account.bankName ?? "—"}</p></div>
              <div><p className="text-xs text-graphite-500">Account</p><p className="mt-1 text-sm font-semibold text-graphite-900">•••• {account.accountLast4 ?? "—"}</p></div>
            </div>
          )}

          <form onSubmit={saveAccount} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-graphite-800">Bank<select value={bankCode} onChange={(event) => setBankCode(event.target.value)} required className="mt-1.5 w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600"><option value="">Select your bank</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}</select></label>
            <label className="text-sm font-medium text-graphite-800">Account number<input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))} inputMode="numeric" minLength={6} maxLength={20} placeholder={account?.configured ? "Enter to update account" : "10-digit account number"} required className="mt-1.5 w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600" /></label>
            <div className="sm:col-span-2"><button disabled={saving || loading} className="rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">{saving ? "Saving…" : account?.configured ? "Update bank account" : "Connect bank account"}</button></div>
          </form>
          <p className="mt-4 text-xs leading-5 text-graphite-500">TTFL Store does not display or store your full bank account number. Paystack handles settlement and bank-account verification.</p>
        </section>

        <section className="mt-6 rounded-card border border-graphite-200 bg-white p-5">
          <h2 className="font-bold text-graphite-900">How you get paid</h2>
          <ol className="mt-3 space-y-3 text-sm text-graphite-600">
            <li><strong className="text-graphite-900">1. Customer pays.</strong> Paystack receives the checkout payment.</li>
            <li><strong className="text-graphite-900">2. TTFL commission is split.</strong> Your plan rate is used for the vendor order.</li>
            <li><strong className="text-graphite-900">3. Your share is settled.</strong> Paystack sends your share to the connected subaccount.</li>
            <li><strong className="text-graphite-900">4. No withdrawal request.</strong> You do not need to ask TTFL Store to manually transfer each sale.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
