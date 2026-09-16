"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiAddress } from "@/lib/api-types";

const ATTRIBUTION_KEY = "ttfl.adCampaign";
const NIGERIAN_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory (FCT)"];
type AddressForm = { label: string; line1: string; line2: string; city: string; state: string; country: string; isDefault: boolean };

export default function CheckoutPage() {
  const cart = useCart();
  const { user, loading } = useAuth();
  const [adCampaignId, setAdCampaignId] = useState<string | undefined>();
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", line1: "", line2: "", city: "", state: "", country: "Nigeria" });
  const [newAddress, setNewAddress] = useState<AddressForm>({ label: "Home", line1: "", line2: "", city: "", state: "", country: "Nigeria", isDefault: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { campaignId?: unknown; capturedAt?: unknown };
      if (typeof parsed.campaignId === "string" && typeof parsed.capturedAt === "number" && Date.now() - parsed.capturedAt <= 30 * 24 * 60 * 60 * 1000) setAdCampaignId(parsed.campaignId);
    } catch {}
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    setForm((current) => ({ ...current, name: `${user.firstName} ${user.lastName}`.trim(), phone: user.phone ?? "" }));
    void loadAddresses();
  }, [loading, user]);

  async function loadAddresses() {
    setAddressLoading(true);
    try {
      const response = await api.get<{ addresses: ApiAddress[] }>("/api/addresses");
      const saved = response.addresses ?? [];
      setAddresses(saved);
      const defaultAddress = saved.find((address) => address.isDefault) ?? saved[0];
      if (defaultAddress) selectAddress(defaultAddress);
      else setAddingAddress(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your saved addresses.");
      setAddingAddress(true);
    } finally {
      setAddressLoading(false);
    }
  }

  function selectAddress(address: ApiAddress) {
    setSelectedAddressId(address.id);
    setAddingAddress(false);
    setForm((current) => ({ ...current, line1: address.line1, line2: address.line2 ?? "", city: address.city, state: address.state, country: address.country || "Nigeria" }));
    setError(null);
  }

  function startAddingAddress() {
    setSelectedAddressId(null);
    setAddingAddress(true);
    setNewAddress({ label: "Home", line1: "", line2: "", city: "", state: "", country: "Nigeria", isDefault: addresses.length === 0 });
    setError(null);
  }

  async function saveNewAddress() {
    if (!newAddress.label || !newAddress.line1 || !newAddress.city || !newAddress.state) {
      setError("Please complete the address label, address, city and state.");
      return;
    }
    setSavingAddress(true); setError(null);
    try {
      const { address } = await api.post<{ address: ApiAddress }>("/api/addresses", newAddress);
      const next = newAddress.isDefault ? addresses.map((item) => ({ ...item, isDefault: false })) : addresses;
      setAddresses([...next, address]);
      selectAddress(address);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function makeDefault(address: ApiAddress) {
    setError(null);
    try {
      const { address: updated } = await api.patch<{ address: ApiAddress }>(`/api/addresses/${address.id}`, { isDefault: true });
      setAddresses((current) => current.map((item) => item.id === updated.id ? updated : { ...item, isDefault: false }));
      selectAddress(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update your default address.");
    }
  }

  if (!loading && !user) return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900">Log in to check out</h1><p className="mt-1 text-sm text-graphite-600">You'll need an account to place an order.</p><a href="/login?next=/checkout" className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700">Log in</a></div>;
  if (cart.lines.length === 0) return <div className="shell py-16 text-center"><h1 className="text-lg font-bold text-graphite-900">Your cart is empty</h1></div>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setSubmitting(true);
    try {
      const { checkoutUrl } = await api.post<{ checkoutUrl: string }>("/api/orders/checkout", { items: cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })), couponCode: cart.appliedCoupon?.code, adCampaignId, delivery: form });
      window.location.href = checkoutUrl;
    } catch (err) { setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again."); setSubmitting(false); }
  }

  return <div className="shell py-8"><h1 className="text-xl font-bold text-graphite-900">Checkout</h1><div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]"><form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-graphite-200 p-5"><h2 className="text-sm font-bold text-graphite-900">Delivery address</h2>
    {!addressLoading && addresses.length > 0 && !addingAddress && <div className="rounded-card border border-graphite-200 bg-cloud-50 p-3"><div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide text-graphite-700">Saved shipping addresses</p><button type="button" onClick={startAddingAddress} className="text-xs font-semibold text-ember-700 hover:text-ember-800">+ Add another address</button></div><div className="grid gap-2">{addresses.map((address) => <button type="button" key={address.id} onClick={() => selectAddress(address)} className={`rounded-card border p-3 text-left transition ${selectedAddressId === address.id ? "border-ember-600 bg-white" : "border-graphite-200 bg-white hover:border-ember-400"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-graphite-900">{address.label}{address.isDefault && <span className="ml-2 rounded-full bg-ember-100 px-2 py-0.5 text-[10px] font-semibold text-ember-700">Default</span>}</p><p className="mt-1 text-xs leading-relaxed text-graphite-600">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}</p></div>{!address.isDefault && <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); void makeDefault(address); }} className="shrink-0 text-[11px] font-semibold text-graphite-500 hover:text-ember-700">Make default</span>}</div></button>)}</div></div>}
    {addingAddress && <div className="rounded-card border border-graphite-200 bg-cloud-50 p-3"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-graphite-700">{addresses.length ? "Add another address" : "Set your shipping address"}</p><p className="mt-0.5 text-xs text-graphite-500">Save it to your account for faster checkout next time.</p></div>{addresses.length > 0 && <button type="button" onClick={() => { const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0]; if (defaultAddress) selectAddress(defaultAddress); }} className="text-xs font-semibold text-graphite-600 hover:text-ember-700">Use saved address</button>}</div><div className="grid gap-3 sm:grid-cols-2"><Field label="Address label" value={newAddress.label} onChange={(v) => setNewAddress({ ...newAddress, label: v })} required /><Field label="Address line 1" value={newAddress.line1} onChange={(v) => setNewAddress({ ...newAddress, line1: v })} required /></div><Field label="Address line 2 (optional)" value={newAddress.line2} onChange={(v) => setNewAddress({ ...newAddress, line2: v })} /><div className="grid gap-3 sm:grid-cols-2"><Field label="City" value={newAddress.city} onChange={(v) => setNewAddress({ ...newAddress, city: v })} required /><StateField value={newAddress.state} onChange={(v) => setNewAddress({ ...newAddress, state: v })} /></div><label className="flex items-center gap-2 text-xs text-graphite-700"><input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />Set as my default shipping address</label><button type="button" onClick={() => void saveNewAddress()} disabled={savingAddress} className="rounded-card border border-graphite-300 bg-white px-4 py-2 text-sm font-semibold text-graphite-800 hover:border-ember-500 disabled:opacity-60">{savingAddress ? "Saving address…" : "Save & use this address"}</button></div>}
    {!addingAddress && selectedAddressId && <p className="text-xs text-graphite-500">Using your saved shipping address. You can choose another address above or add a new one.</p>}
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required /><Field label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required /></div><Field label="Address line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} required /><Field label="Address line 2 (optional)" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} /><div className="grid gap-4 sm:grid-cols-2"><Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required /><StateField value={form.state} onChange={(v) => setForm({ ...form, state: v })} /></div>{error&&<p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}<button type="submit" disabled={submitting || addressLoading || savingAddress} className="mt-2 rounded-card bg-ember-600 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60">{submitting?"Redirecting to payment…":`Pay ${formatNaira(Math.max(0,cart.totalAmount-(cart.appliedCoupon?.discountAmount??0)))} with Paystack`}</button></form><div className="h-fit rounded-card border border-graphite-200 p-5"><h2 className="text-sm font-bold text-graphite-900">Order summary</h2><div className="mt-3 flex flex-col gap-2">{cart.lines.map((l)=><div key={l.productId} className="flex justify-between text-sm text-graphite-700"><span className="truncate pr-2">{l.name} × {l.quantity}</span><span className="shrink-0 font-mono">{formatNaira(l.price*l.quantity)}</span></div>)}</div><div className="mt-3 flex justify-between border-t border-graphite-200 pt-3 text-sm font-semibold text-graphite-900"><span>Total</span><span className="font-mono">{formatNaira(cart.totalAmount)}</span></div>{cart.appliedCoupon&&<><div className="mt-1.5 flex justify-between text-sm text-verified-700"><span>Discount ({cart.appliedCoupon.code})</span><span className="font-mono">−{formatNaira(cart.appliedCoupon.discountAmount)}</span></div><div className="mt-1.5 flex justify-between border-t border-graphite-200 pt-1.5 text-sm font-semibold text-graphite-900"><span>You'll pay</span><span className="font-mono">{formatNaira(Math.max(0,cart.totalAmount-cart.appliedCoupon.discountAmount))}</span></div></>}</div></div></div>;
}

function Field({label,value,onChange,required}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean}){return <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700">{label}</span><input value={value} onChange={(e)=>onChange(e.target.value)} required={required} className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-ember-600"/></label>}

function StateField({value,onChange}:{value:string;onChange:(v:string)=>void}){return <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700">State</span><select value={value} onChange={(e)=>onChange(e.target.value)} required className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2 text-sm outline-none focus:border-ember-600"><option value="">Select your state</option>{NIGERIAN_STATES.map((state)=><option key={state} value={state}>{state}</option>)}</select></label>}
