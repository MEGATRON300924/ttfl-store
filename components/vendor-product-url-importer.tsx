"use client";

import { useState } from "react";
import { ArrowDownToLine, Link2, Loader2, PackageSearch } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

type ImportResult = {
  sourceUrl: string;
  supplier: string;
  extracted: { name: string | null; description: string | null; images: string[] };
  supplierPrice: { amount: number; currency: string | null } | null;
  conversion: { usd: number | null; ngn: number | null; ngnPerUsd: number | null; source: string; timestamp: string | null };
  warnings: string[];
};

export function VendorProductUrlImporter({ onImport }: { onImport: (result: ImportResult) => void }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const response = await api.post<ImportResult>("/api/products/import-url", { url: url.trim() });
      setResult(response);
      onImport(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't import this page. You can still enter the product details manually.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-graphite-200 bg-cloud-50 p-4 dark:border-graphite-700 dark:bg-graphite-900/60">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-ember-700 shadow-sm dark:bg-graphite-800"><PackageSearch className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-graphite-900 dark:text-white">Import from supplier URL</h2>
          <p className="mt-1 text-xs leading-5 text-graphite-500 dark:text-graphite-400">Paste an AliExpress, Jiji, SHEIN or Jumia product link to prefill supported details. You can edit everything before listing.</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
          <input value={url} onChange={(event) => setUrl(event.target.value)} type="url" placeholder="AliExpress, Jiji, SHEIN or Jumia product URL" className="w-full rounded-lg border border-graphite-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950 dark:text-white" />
        </label>
        <button type="button" onClick={handleImport} disabled={loading || !url.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
          {loading ? "Importing…" : "Import details"}
        </button>
      </div>
      {error && <div role="alert" aria-live="polite" className="mt-3 rounded-xl border border-graphite-700 bg-graphite-900 px-3 py-3 text-sm leading-6 text-graphite-100 shadow-sm"><p className="mb-1 text-xs font-semibold text-rose-300">Import couldn’t be completed</p><p className="select-text break-words text-graphite-100">{error}</p><p className="mt-2 text-[11px] text-graphite-400">You can select and copy this message, then share it with TTFL support.</p></div>}
      {result && (
        <div className="mt-3 rounded-xl border border-graphite-200 bg-white p-3 dark:border-graphite-700 dark:bg-graphite-950">
          <p className="text-xs font-semibold text-graphite-800 dark:text-white">Imported from {result.supplier}</p>
          <p className="mt-1 break-all text-[11px] text-graphite-400">{result.sourceUrl}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-cloud-50 p-2 dark:bg-graphite-900"><p className="text-[11px] text-graphite-500">Supplier price</p><p className="mt-1 text-sm font-semibold text-graphite-900 dark:text-white">{result.supplierPrice ? `${result.supplierPrice.currency ?? ""} ${result.supplierPrice.amount.toLocaleString()}` : "Not found"}</p></div>
            <div className="rounded-lg bg-cloud-50 p-2 dark:bg-graphite-900"><p className="text-[11px] text-graphite-500">USD equivalent</p><p className="mt-1 text-sm font-semibold text-graphite-900 dark:text-white">{result.conversion.usd === null ? "Unavailable" : `$${result.conversion.usd.toLocaleString()}`}</p></div>
            <div className="rounded-lg bg-cloud-50 p-2 dark:bg-graphite-900"><p className="text-[11px] text-graphite-500">NGN equivalent</p><p className="mt-1 text-sm font-semibold text-graphite-900 dark:text-white">{result.conversion.ngn === null ? "Unavailable" : `₦${result.conversion.ngn.toLocaleString()}`}</p></div>
          </div>
          {result.conversion.ngnPerUsd && <p className="mt-2 text-[11px] text-graphite-400">Reference rate: $1 = ₦{result.conversion.ngnPerUsd.toLocaleString()} · {result.conversion.timestamp ? new Date(result.conversion.timestamp).toLocaleString() : "rate time unavailable"} · {result.conversion.source}</p>}
          <p className="mt-2 text-xs leading-5 text-ember-700 dark:text-ember-300">Supplier cost is only a reference. It has not been entered as your selling price. Set your own price below.</p>
          {result.warnings.map((warning) => <p key={warning} className="mt-1 text-[11px] leading-5 text-graphite-500">{warning}</p>)}
          {result.extracted.images.length > 0 && <p className="mt-2 text-[11px] text-graphite-500">{result.extracted.images.length} supplier image(s) added to the editable product gallery. Re-upload images to your own media storage where possible.</p>}
        </div>
      )}
      <p className="mt-2 text-[11px] text-graphite-400">Supports AliExpress, Jiji Nigeria, SHEIN and Jumia product pages. Some listings may block automated extraction; if that happens, enter the details manually.</p>
    </section>
  );
}
