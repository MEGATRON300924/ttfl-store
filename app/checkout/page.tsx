"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";

export default function CheckoutPage() {
  const cart = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "Nigeria",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && !user) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">Log in to check out</h1>
        <p className="mt-1 text-sm text-graphite-600">You'll need an account to place an order.</p>
        <a
          href="/login?next=/checkout"
          className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
        >
          Log in
        </a>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">Your cart is empty</h1>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { checkoutUrl } = await api.post<{ checkoutUrl: string }>("/api/orders/checkout", {
        items: cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        couponCode: cart.appliedCoupon?.code,
        delivery: form,
      });
      // Cart is cleared once payment is confirmed (webhook/verify), not
      // here — if the customer abandons the Paystack page, their cart
      // should still be there when they come back.
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-graphite-200 p-5">
          <h2 className="text-sm font-bold text-graphite-900">Delivery address</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          </div>
          <Field label="Address line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} required />
          <Field label="Address line 2 (optional)" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
          </div>

          {error && (
            <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-card bg-ember-600 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
          >
            {submitting
              ? "Redirecting to payment…"
              : `Pay ${formatNaira(Math.max(0, cart.totalAmount - (cart.appliedCoupon?.discountAmount ?? 0)))} with Paystack`}
          </button>
        </form>

        <div className="h-fit rounded-card border border-graphite-200 p-5">
          <h2 className="text-sm font-bold text-graphite-900">Order summary</h2>
          <div className="mt-3 flex flex-col gap-2">
            {cart.lines.map((l) => (
              <div key={l.productId} className="flex justify-between text-sm text-graphite-700">
                <span className="truncate pr-2">
                  {l.name} × {l.quantity}
                </span>
                <span className="shrink-0 font-mono">{formatNaira(l.price * l.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-graphite-200 pt-3 text-sm font-semibold text-graphite-900">
            <span>Total</span>
            <span className="font-mono">{formatNaira(cart.totalAmount)}</span>
          </div>
          {cart.appliedCoupon && (
            <>
              <div className="mt-1.5 flex justify-between text-sm text-verified-700">
                <span>Discount ({cart.appliedCoupon.code})</span>
                <span className="font-mono">−{formatNaira(cart.appliedCoupon.discountAmount)}</span>
              </div>
              <div className="mt-1.5 flex justify-between border-t border-graphite-200 pt-1.5 text-sm font-semibold text-graphite-900">
                <span>You'll pay</span>
                <span className="font-mono">
                  {formatNaira(Math.max(0, cart.totalAmount - cart.appliedCoupon.discountAmount))}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-graphite-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-ember-600"
      />
    </label>
  );
}
