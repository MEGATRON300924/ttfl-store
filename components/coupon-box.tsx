"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { CartLine } from "@/lib/cart-context";

export type AppliedCoupon = { code: string; discountAmount: number };

export function CouponBox({
  lines,
  applied,
  onApply,
  onRemove,
}: {
  lines: CartLine[];
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function apply() {
    if (!code.trim()) return;
    setError(null);
    setChecking(true);
    try {
      // Same validateCoupon() function real checkout calls — this is a
      // preview, not a second source of truth, so it can never show a
      // discount that checkout itself would reject.
      const result = await api.post<{ coupon: { code: string }; discountAmount: number }>("/api/coupons/preview", {
        code: code.trim(),
        lines: lines.map((l) => ({ vendorId: l.vendorId, categoryId: l.categoryId, lineTotal: l.price * l.quantity })),
      });
      onApply({ code: result.coupon.code, discountAmount: result.discountAmount });
      setCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't apply that coupon");
    } finally {
      setChecking(false);
    }
  }

  if (applied) {
    return (
      <div className="mt-3 flex items-center justify-between rounded-card bg-verified-100 px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm text-verified-700">
          <Tag className="h-4 w-4" />
          <span className="font-mono font-semibold">{applied.code}</span>
          <span>−{formatNaira(applied.discountAmount)}</span>
        </div>
        <button onClick={onRemove} aria-label="Remove coupon" className="text-verified-700 hover:text-verified-700/70">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="w-full rounded-[7px] border border-graphite-200 px-3 py-2 text-sm font-mono outline-none focus:border-ember-600"
        />
        <button
          onClick={apply}
          disabled={checking}
          className="shrink-0 rounded-card border border-graphite-300 px-3 py-2 text-sm font-semibold text-graphite-900 hover:bg-cloud-100 disabled:opacity-60"
        >
          {checking ? "Checking…" : "Apply"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-ember-600">{error}</p>}
    </div>
  );
}
