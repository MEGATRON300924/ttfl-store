"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, AlertTriangle, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

type ErrorLog = {
  id: string;
  referenceCode: string;
  severity: string;
  httpStatus: number;
  errorCode: string;
  message: string;
  explanation: string;
  method: string;
  path: string;
  userId: string | null;
  orderId: string | null;
  orderNumber: string | null;
  productId: string | null;
  productName: string | null;
  vendorId: string | null;
  vendorName: string | null;
  metadata: unknown;
  stack: string | null;
  createdAt: string;
};

export default function AdminErrorLogsPage() {
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [selected, setSelected] = useState<ErrorLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(search = query) {
    setLoading(true);
    setError("");
    try {
      const result = await api.get<{ items: ErrorLog[] }>(`/api/errors/admin/error-logs?q=${encodeURIComponent(search.trim())}&limit=100`);
      setLogs(result.items);
      if (selected) setSelected(result.items.find((item) => item.referenceCode === selected.referenceCode) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load error logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(""); }, []);

  return (
    <div className="shell py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/audit-logs" className="inline-flex items-center gap-1 text-xs font-semibold text-graphite-600 hover:text-ember-600">
            <ArrowLeft className="h-3.5 w-3.5" /> Audit logs
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-graphite-900">TTFL Error Logs</h1>
          <p className="mt-1 text-sm text-graphite-600">Search customer error codes and see the technical context needed to resolve support tickets.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void load(); }} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search error code, order number, product ID or product name…" className="w-full rounded-card border border-graphite-200 bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-ember-600" />
        </div>
        <button className="rounded-card bg-graphite-900 px-5 py-3 text-sm font-semibold text-white">Search</button>
      </form>

      {error && <p className="mt-4 rounded-card bg-ember-100 px-4 py-3 text-sm text-ember-700">{error}</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_420px]">
        <div className="overflow-x-auto rounded-card border border-graphite-200 bg-white">
          {loading ? <p className="p-5 text-sm text-graphite-600">Loading error logs…</p> : logs.length === 0 ? <div className="p-8 text-center"><AlertTriangle className="mx-auto h-7 w-7 text-graphite-400" /><p className="mt-2 text-sm text-graphite-600">No matching errors.</p></div> : (
            <table className="w-full text-left text-sm">
              <thead className="bg-cloud-100 text-xs uppercase text-graphite-600"><tr><th className="px-3 py-2">Error code</th><th className="px-3 py-2">Problem</th><th className="px-3 py-2">Resource</th><th className="px-3 py-2">When</th></tr></thead>
              <tbody className="divide-y divide-graphite-100">
                {logs.map((log) => <tr key={log.id} onClick={() => setSelected(log)} className={`cursor-pointer hover:bg-cloud-50 ${selected?.id === log.id ? "bg-cloud-50" : ""}`}>
                  <td className="px-3 py-3"><p className="font-mono text-xs font-bold text-ember-700">{log.referenceCode}</p><p className="mt-1 text-[11px] text-graphite-500">{log.errorCode}</p></td>
                  <td className="max-w-xs px-3 py-3"><p className="truncate text-graphite-900">{log.message}</p><p className="mt-1 text-xs text-graphite-500">{log.method} {log.path}</p></td>
                  <td className="px-3 py-3 text-xs text-graphite-600">{log.orderNumber ? `Order ${log.orderNumber}` : log.productName ? `Product: ${log.productName}` : "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-graphite-500">{new Date(log.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td>
                </tr>)}
              </tbody>
            </table>
          )}
        </div>

        <aside className="rounded-card border border-graphite-200 bg-white p-5">
          {!selected ? <div className="py-12 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-graphite-300" /><p className="mt-2 text-sm text-graphite-500">Select an error to inspect the audit context.</p></div> : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-600">Error audit</p>
              <h2 className="mt-2 break-all font-mono text-lg font-bold text-graphite-900">{selected.referenceCode}</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div><p className="text-xs font-semibold uppercase text-graphite-500">What happened</p><p className="mt-1 text-graphite-800">{selected.message}</p></div>
                <div><p className="text-xs font-semibold uppercase text-graphite-500">Admin explanation</p><p className="mt-1 leading-6 text-graphite-700">{selected.explanation}</p></div>
                <div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-graphite-500">Error type</p><p className="font-mono text-xs font-semibold">{selected.errorCode}</p></div><div><p className="text-xs text-graphite-500">HTTP status</p><p className="font-semibold">{selected.httpStatus}</p></div></div>
                {selected.orderNumber && <div><p className="text-xs text-graphite-500">Order</p><p className="font-mono text-xs font-semibold">{selected.orderNumber}</p></div>}
                {selected.productId && <div><p className="text-xs text-graphite-500">Product</p><p className="font-semibold">{selected.productName || "Unknown product"}</p><p className="font-mono text-[11px] text-graphite-500">{selected.productId}</p></div>}
                {selected.vendorName && <div><p className="text-xs text-graphite-500">Vendor</p><p className="font-semibold">{selected.vendorName}</p><p className="font-mono text-[11px] text-graphite-500">{selected.vendorId}</p></div>}
                <div><p className="text-xs text-graphite-500">Request</p><p className="font-mono text-xs">{selected.method} {selected.path}</p></div>
                {selected.stack && <details><summary className="cursor-pointer text-xs font-semibold text-graphite-600">Server stack trace</summary><pre className="mt-2 max-h-64 overflow-auto rounded-[7px] bg-graphite-950 p-3 text-[10px] leading-5 text-white">{selected.stack}</pre></details>}
                {selected.metadata && <details><summary className="cursor-pointer text-xs font-semibold text-graphite-600">Metadata</summary><pre className="mt-2 max-h-48 overflow-auto rounded-[7px] bg-cloud-50 p-3 text-[10px] leading-5 text-graphite-700">{JSON.stringify(selected.metadata, null, 2)}</pre></details>}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
