"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { TextField } from "@/components/text-field";

export default function SellPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    storeName: "",
    whatsappNumber: "",
    location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/auth/register/vendor", form);
      await refresh();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="shell flex min-h-[70vh] items-center justify-center py-12 text-center">
        <div>
          <CheckCircle2 className="mx-auto h-12 w-12 text-verified-600" />
          <h1 className="mt-4 text-lg font-bold text-graphite-900">Application received</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-graphite-600">
            Thanks for applying to sell as <strong>{form.storeName}</strong>. Our team reviews new vendors
            before your store goes live — you'll get an email once you're approved.
          </p>
          <button
            onClick={() => router.push("/vendor/dashboard")}
            className="mt-6 rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
          >
            Go to vendor dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-graphite-900">Sell on TTFL Store</h1>
        <p className="mt-1 text-sm text-graphite-600">
          Set up your storefront. Applications are reviewed before you can list products.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <TextField label="Store name" value={form.storeName} onChange={(v) => setForm({ ...form, storeName: v })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
            <TextField label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          </div>
          <TextField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <TextField
              label="WhatsApp (optional)"
              value={form.whatsappNumber}
              onChange={(v) => setForm({ ...form, whatsappNumber: v })}
              optional
            />
          </div>
          <TextField label="Location (optional)" value={form.location} onChange={(v) => setForm({ ...form, location: v })} optional />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            hint="At least 8 characters, with upper, lower, and a number"
          />

          {error && <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Apply to sell"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-graphite-600">
          Just shopping?{" "}
          <Link href="/register" className="font-medium text-ember-600 hover:text-ember-700">
            Create a customer account
          </Link>
        </p>
      </div>
    </div>
  );
}
