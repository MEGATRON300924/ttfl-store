"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, LogOut, Pencil, Heart, Loader2, Plus, Trash2, MapPin, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiOrder, OrderStatus, ApiAddress } from "@/lib/api-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-cloud-100 text-graphite-700",
  PROCESSING: "bg-gold-100 text-gold-600",
  SHIPPED: "bg-gold-100 text-gold-600",
  OUT_FOR_DELIVERY: "bg-gold-100 text-gold-600",
  DELIVERED: "bg-verified-100 text-verified-700",
  CANCELLED: "bg-ember-100 text-ember-700",
  REFUND_REQUESTED: "bg-ember-100 text-ember-700",
  REFUNDED: "bg-cloud-100 text-graphite-700",
  FAILED: "bg-ember-100 text-ember-700",
};

export default function AccountPage() {
  const { user, loading, logout, refresh } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);

  useEffect(() => {
    if (user) {
      api.get<{ orders: ApiOrder[] }>("/api/orders/me").then((r) => setOrders(r.orders));
    }
  }, [user]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (!loading && !user) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">Log in to view your account</h1>
        <Link
          href="/login?next=/account"
          className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-graphite-900">
          {user ? `Hi, ${user.firstName}` : "My account"}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 rounded-card border border-graphite-300 px-3 py-2 text-sm font-medium text-graphite-900 hover:bg-cloud-100"
          >
            <Heart className="h-4 w-4" />
            Wishlist
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-card border border-graphite-300 px-3 py-2 text-sm font-medium text-graphite-900 hover:bg-cloud-100"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>

      <ProfileSection onUpdated={refresh} />
      <AddressBook />

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-graphite-600">Order history</h2>

      {orders === null ? (
        <p className="text-sm text-graphite-600">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">
          <Package className="mx-auto mb-2 h-8 w-8 text-graphite-300" />
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-card border border-graphite-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-graphite-900">{order.orderNumber}</p>
                  <p className="text-xs text-graphite-400">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-graphite-900">
                  {formatNaira(Number(order.totalAmount))}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {order.vendorOrders.map((vo) => (
                  <span
                    key={vo.id}
                    className={`rounded-tag px-2 py-1 text-xs font-medium ${STATUS_STYLES[vo.status]}`}
                  >
                    {vo.items.length} item(s) · {vo.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                ))}
                {order.paymentStatus !== "PAID" && (
                  <span className="rounded-tag bg-ember-100 px-2 py-1 text-xs font-medium text-ember-700">
                    Payment {order.paymentStatus.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile — avatar, name, phone
// ---------------------------------------------------------------------------

function ProfileSection({ onUpdated }: { onUpdated: () => Promise<void> }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function saveProfile() {
    setError(null);
    setSaving(true);
    try {
      await api.patch("/api/auth/me", { firstName, lastName, phone: phone || undefined });
      await onUpdated();
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarFile(file: File) {
    setError(null);
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_URL}/api/uploads/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Upload failed");
      await api.patch("/api/auth/me/avatar", { avatarUrl: json.url });
      await onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload your photo");
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (!user) return null;

  return (
    <section className="mt-6 rounded-card border border-graphite-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="group relative">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-cloud-100">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Profile photo" fill sizes="64px" className="object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-lg font-bold text-graphite-500">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -right-1 -bottom-1 grid h-6 w-6 place-items-center rounded-full bg-graphite-900 text-white shadow-card disabled:opacity-60"
              aria-label="Change profile photo"
            >
              {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleAvatarFile(file);
              }}
            />
          </div>

          {!editing ? (
            <div>
              <p className="font-semibold text-graphite-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-graphite-600">{user.email}</p>
              {user.phone && <p className="text-sm text-graphite-600">{user.phone}</p>}
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="rounded-[7px] border border-graphite-200 px-2.5 py-1.5 text-sm"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="rounded-[7px] border border-graphite-200 px-2.5 py-1.5 text-sm"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="rounded-[7px] border border-graphite-200 px-2.5 py-1.5 text-sm"
              />
            </div>
          )}
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-card border border-graphite-300 px-3 py-1.5 text-xs font-semibold text-graphite-900 hover:bg-cloud-100"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded-card bg-ember-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-card border border-graphite-300 px-3 py-1.5 text-xs font-semibold text-graphite-900 hover:bg-cloud-100"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-ember-600">{error}</p>}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Shipping addresses
// ---------------------------------------------------------------------------

function AddressBook() {
  const [addresses, setAddresses] = useState<ApiAddress[] | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { addresses } = await api.get<{ addresses: ApiAddress[] }>("/api/addresses");
    setAddresses(addresses);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Remove this address?")) return;
    await api.delete(`/api/addresses/${id}`);
    await load();
  }

  async function setDefault(id: string) {
    await api.patch(`/api/addresses/${id}`, { isDefault: true });
    await load();
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-graphite-600">Shipping addresses</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 text-sm font-medium text-ember-600 hover:text-ember-700"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add address"}
        </button>
      </div>

      {showForm && (
        <AddressForm
          onSaved={() => {
            setShowForm(false);
            void load();
          }}
        />
      )}

      <div className="mt-3 flex flex-col gap-2">
        {addresses === null ? (
          <p className="text-sm text-graphite-600">Loading…</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-graphite-600">No saved addresses yet.</p>
        ) : (
          addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 rounded-card border border-graphite-200 p-3">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-graphite-400" />
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-graphite-900">
                    {a.label}
                    {a.isDefault && (
                      <span className="rounded-tag bg-verified-100 px-1.5 py-0.5 text-[10px] font-semibold text-verified-700">
                        DEFAULT
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-graphite-600">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state}, {a.country}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {!a.isDefault && (
                  <button
                    onClick={() => setDefault(a.id)}
                    className="text-xs font-medium text-graphite-600 hover:text-graphite-900"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => remove(a.id)}
                  className="text-graphite-400 hover:text-ember-600"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function AddressForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "Nigeria",
    isDefault: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/api/addresses", form);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save this address");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-3 rounded-card border border-graphite-200 p-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="Label (e.g. Home)"
          className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm"
        />
        <input
          required
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="City"
          className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm"
        />
      </div>
      <input
        required
        value={form.line1}
        onChange={(e) => setForm({ ...form, line1: e.target.value })}
        placeholder="Address line 1"
        className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm"
      />
      <input
        value={form.line2}
        onChange={(e) => setForm({ ...form, line2: e.target.value })}
        placeholder="Address line 2 (optional)"
        className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          placeholder="State"
          className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm"
        />
        <input
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          placeholder="Country"
          className="rounded-[7px] border border-graphite-200 px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-graphite-700">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
        />
        Set as default address
      </label>

      {error && <p className="text-xs text-ember-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-card bg-ember-600 py-2 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}
