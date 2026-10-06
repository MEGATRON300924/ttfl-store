"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Store, EyeOff, LayoutTemplate, CarFront, Home, Package, Smartphone, ArrowRight, LogIn } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { TextField } from "@/components/text-field";
import type { ApiCategory } from "@/lib/api-types";

type StoreType = "PUBLIC" | "PRIVATE" | "DISPLAY";
type Marketplace = "CARS" | "HOMES" | "GENERAL" | "MINIMAL";

const storeTypes: [StoreType, string, string, typeof Store][] = [
  ["PUBLIC", "Public Store", "Your store can be discovered by customers across TTFL Store.", Store],
  ["DISPLAY", "Display Store", "A public business storefront for services, brand promotion, and advertising.", LayoutTemplate],
  ["PRIVATE", "Private Store", "Keep your store out of public discovery while you manage it privately.", EyeOff],
];

const marketplaces: [Marketplace, string, string, typeof Store][] = [
  ["CARS", "Cars", "Cars, SUVs, trucks, motorcycles and other vehicles.", CarFront],
  ["HOMES", "Homes", "Houses, apartments, land and other property listings.", Home],
  ["GENERAL", "Normal products", "A full TTFL Store covering your usual product categories.", Package],
  ["MINIMAL", "Minimal products", "Focused everyday products such as phones, gadgets, groceries and similar goods.", Smartphone],
];

export default function SellPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [step, setStep] = useState<"marketplace" | "details">("marketplace");
  const [marketplace, setMarketplace] = useState<Marketplace>("GENERAL");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "",
    storeName: "", storeCategory: "", storeType: "PUBLIC" as StoreType,
    whatsappNumber: "", location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get<{ categories: ApiCategory[] }>("/api/categories")
      .then(r => { if (mounted) setCategories(r.categories); })
      .catch(() => undefined)
      .finally(() => { if (mounted) setLoadingCategories(false); });
    return () => { mounted = false; };
  }, []);

  if (authLoading) {
    return <div className="shell flex min-h-[70vh] items-center justify-center py-12"><p className="text-sm text-graphite-500">Checking your TTFL Store account…</p></div>;
  }

  if (!user) {
    return (
      <div className="shell flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-card border border-graphite-200 bg-white p-6 shadow-card">
          <span className="grid h-11 w-11 place-items-center rounded-card bg-ember-100 text-ember-600"><Store className="h-5 w-5" /></span>
          <h1 className="mt-5 text-2xl font-bold text-graphite-900">Sell on TTFL Store</h1>
          <p className="mt-2 text-sm leading-6 text-graphite-600">Sign in to your TTFL account first. If you are new to TTFL, create your account and we’ll continue your seller setup afterwards.</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Link href="/login?next=/sell" className="inline-flex items-center justify-center gap-2 rounded-card bg-ember-600 px-4 py-3 text-sm font-semibold text-white hover:bg-ember-700"><LogIn className="h-4 w-4" /> Sign in</Link>
            <Link href="/register?next=/sell" className="inline-flex items-center justify-center rounded-card border border-graphite-200 px-4 py-3 text-sm font-semibold text-graphite-800 hover:border-ember-500">Create account</Link>
          </div>
          <p className="mt-4 text-center text-xs text-graphite-400">Your TTFL account is shared across the marketplace.</p>
        </div>
      </div>
    );
  }

  function chooseMarketplace(value: Marketplace) {
    setMarketplace(value);
    if (value === "CARS") {
      window.location.href = "https://cars.ttflstore.name.ng/register?next=/sell";
      return;
    }
    if (value === "HOMES") {
      window.location.href = "https://homes.ttflstore.name.ng/register?next=/sell";
      return;
    }
    setStep("details");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.storeCategory) return setError("Please choose your store category.");
    setSubmitting(true);
    try {
      if (!user) {
        setError("Your TTFL account session has expired. Please sign in again.");
        setSubmitting(false);
        return;
      }
      if (user.role === "VENDOR") {
        router.push("/vendor/dashboard");
        return;
      }
      await api.post("/api/auth/apply/vendor", {
        storeName: form.storeName,
        storeCategory: form.storeCategory,
        storeType: form.storeType,
        whatsappNumber: form.whatsappNumber,
        location: form.location,
      });
      setSubmitting(false);
      setSubmitted(true);
      void router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (submitted) return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-12 text-center">
      <div>
        <CheckCircle2 className="mx-auto h-12 w-12 text-verified-600" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">Application received</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-graphite-600">Thanks for applying to sell as <strong>{form.storeName}</strong>. Our team reviews new vendors before your store goes live — you'll get an email once you're approved.</p>
        <button onClick={() => router.push("/vendor/dashboard")} className="mt-6 rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">Go to vendor dashboard</button>
      </div>
    </div>
  );

  if (step === "marketplace") return (
    <div className="shell py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-ember-600">Seller onboarding</p>
        <h1 className="mt-2 text-2xl font-bold text-graphite-900 sm:text-3xl">What do you want to sell?</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Choose the marketplace that best fits your business. You can use your TTFL account across TTFL Store, TTFL Cars and TTFL Homes.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {marketplaces.map(([type, label, description, Icon]) => (
            <button key={type} type="button" onClick={() => chooseMarketplace(type)} className="group rounded-card border border-graphite-200 bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-ember-500 hover:shadow-card-hover">
              <span className="grid h-11 w-11 place-items-center rounded-card bg-cloud-100 text-ember-600 group-hover:bg-ember-100"><Icon className="h-5 w-5" /></span>
              <span className="mt-4 flex items-center justify-between gap-3"><strong className="text-base text-graphite-900">{label}</strong><ArrowRight className="h-4 w-4 text-graphite-400 transition group-hover:translate-x-0.5 group-hover:text-ember-600" /></span>
              <span className="mt-2 block text-sm leading-6 text-graphite-500">{description}</span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs text-graphite-400">You selected <strong>{user.firstName} {user.lastName}</strong>. Your login remains the same wherever you sell.</p>
      </div>
    </div>
  );

  return (
    <div className="shell py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <button onClick={() => setStep("marketplace")} className="text-sm font-semibold text-ember-600 hover:text-ember-700">← Change marketplace</button>
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-ember-600">Seller onboarding · {marketplaces.find(x => x[0] === marketplace)?.[1]}</p>
          <h1 className="mt-2 text-2xl font-bold text-graphite-900">Set up your store</h1>
          <p className="mt-1 text-sm text-graphite-600">Your TTFL account is already signed in. Complete the storefront details below.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <TextField label="Store name" value={form.storeName} onChange={v => setForm({ ...form, storeName: v })} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite-700">Store category</span>
            <select required value={form.storeCategory} onChange={e => setForm({ ...form, storeCategory: e.target.value })} disabled={loadingCategories || !categories.length} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 disabled:cursor-not-allowed disabled:bg-cloud-100">
              <option value="" disabled>{loadingCategories ? "Loading categories..." : "Choose your main store category"}</option>
              {categories.map(category => <option key={category.id} value={category.slug}>{category.name}</option>)}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-medium text-graphite-700">Store type</legend>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {storeTypes.map(([type, label, description, Icon]) => (
                <label key={type} className={`cursor-pointer rounded-card border p-4 transition ${form.storeType === type ? "border-ember-600 bg-ember-50 shadow-sm" : "border-graphite-200 bg-white hover:border-graphite-300"}`}>
                  <input type="radio" name="storeType" value={type} checked={form.storeType === type} onChange={() => setForm({ ...form, storeType: type })} className="sr-only" />
                  <span className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-cloud-100"><Icon className="h-4 w-4 text-ember-600" /></span><span className="font-semibold text-graphite-900">{label}</span>{form.storeType === type && <span className="ml-auto h-2 w-2 rounded-full bg-ember-600" />}</span>
                  <span className="mt-3 block text-xs leading-5 text-graphite-500">{description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name" value={form.firstName || user.firstName || ""} onChange={v => setForm({ ...form, firstName: v })} />
            <TextField label="Last name" value={form.lastName || user.lastName || ""} onChange={v => setForm({ ...form, lastName: v })} />
          </div>
          <TextField label="Email" type="email" value={form.email || user.email || ""} onChange={v => setForm({ ...form, email: v })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Phone" value={form.phone || user.phone || ""} onChange={v => setForm({ ...form, phone: v })} />
            <TextField label="WhatsApp (optional)" value={form.whatsappNumber} onChange={v => setForm({ ...form, whatsappNumber: v })} optional />
          </div>
          <TextField label="Location (optional)" value={form.location} onChange={v => setForm({ ...form, location: v })} optional />
          <TextField label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} hint="Your TTFL account password is not needed here." />
          {error && <p role="alert" className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
          <button type="submit" disabled={submitting || loadingCategories || !categories.length} className="mt-2 rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">{submitting ? "Submitting…" : "Apply to sell"}</button>
        </form>
      </div>
    </div>
  );
}
