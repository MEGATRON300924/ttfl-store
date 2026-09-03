"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import { StoreBadges, type StoreBadge } from "@/components/store-badges";

type ProfileData = {
  vendorProfile: { storeName: string; storeSlug: string; tier: string };
  profile: { headline: string | null; description: string | null; theme: string; accentColor: string; layout: string; customUrl: string | null };
  badges: StoreBadge[];
  gallery: { id: string; url: string; publicId: string; position: number }[];
  enterprise: boolean;
};

export default function PublicProfileSettingsPage() {
  const { user, loading } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ headline: "", description: "", theme: "CLASSIC", accentColor: "#E8622C", layout: "STANDARD", customUrl: "" });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const result = await api.get<ProfileData>("/api/store-profile/me");
    setData(result);
    setForm({ headline: result.profile.headline ?? "", description: result.profile.description ?? "", theme: result.profile.theme, accentColor: result.profile.accentColor, layout: result.profile.layout, customUrl: result.profile.customUrl ?? "" });
  }

  useEffect(() => {
    if (user?.role === "VENDOR") void load().catch(() => setError("Unable to load public profile settings."));
  }, [user?.role]);

  async function save() {
    setBusy(true); setMessage(""); setError("");
    try { const result = await api.patch<ProfileData>("/api/store-profile/me", { ...form, customUrl: form.customUrl || null }); setData(result); setMessage("Public profile saved."); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Unable to save public profile."); }
    finally { setBusy(false); }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Use an image under 5MB."); return; }
    setUploading(true); setError(""); setMessage("");
    try {
      const body = new FormData(); body.append("image", file);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      const response = await fetch(`${apiUrl}/api/store-profile/me/gallery`, { method: "POST", credentials: "include", body });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message ?? "Gallery upload failed.");
      await load(); setMessage("Gallery image added.");
    } catch (err) { setError(err instanceof Error ? err.message : "Gallery upload failed."); }
    finally { setUploading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Remove this gallery image?")) return;
    try { await api.delete(`/api/store-profile/me/gallery/${id}`); await load(); setMessage("Gallery image removed."); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Unable to remove image."); }
  }

  if (loading || (user?.role === "VENDOR" && !data && !error)) return <div className="shell py-16 text-center text-sm text-graphite-600"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  if (!user || user.role !== "VENDOR") return <div className="shell py-16 text-center"><h1 className="text-xl font-bold">Vendor access only</h1><p className="mt-2 text-sm text-graphite-600">Log in with a vendor account to manage your store.</p></div>;
  if (!data) return <div className="shell py-16 text-center text-sm text-ember-600">{error || "Unable to load profile."}</div>;

  if (!data.enterprise) return (
    <div className="shell py-8">
      <Link href="/vendor/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-graphite-600"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
      <div className="mt-8 max-w-2xl rounded-card border border-graphite-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">Enterprise feature</p>
        <h1 className="mt-2 text-2xl font-bold text-graphite-900">Custom public store profile</h1>
        <p className="mt-2 text-sm leading-6 text-graphite-600">Enterprise stores can customize their public storefront, use a custom store link, choose a profile layout, and publish a gallery of up to 12 images.</p>
        <Link href="/vendor/dashboard" className="mt-5 inline-flex rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white">Back to dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="shell py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><Link href="/vendor/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-graphite-600"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link><h1 className="mt-4 text-2xl font-bold text-graphite-900">Public store profile</h1><p className="mt-1 text-sm text-graphite-600">Customize how customers see your Enterprise storefront.</p></div>
        <Link href={`/store/${data.vendorProfile.storeSlug}`} target="_blank" className="rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-800">View storefront</Link>
      </div>

      {message && <div className="mt-5 flex items-center gap-2 rounded-card border border-verified-100 bg-verified-100 p-3 text-sm font-medium text-verified-700"><CheckCircle2 className="h-4 w-4" />{message}</div>}
      {error && <div className="mt-5 rounded-card border border-ember-100 bg-ember-100 p-3 text-sm font-medium text-ember-700">{error}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold text-graphite-900">Profile appearance</h2>
          <p className="mt-1 text-sm text-graphite-600">These controls are available only to Enterprise stores.</p>
          <div className="mt-6 space-y-5">
            <div><label className="mb-1.5 block text-sm font-semibold">Headline</label><input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} maxLength={160} className="w-full rounded-card border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600" placeholder="A short statement customers remember" /></div>
            <div><label className="mb-1.5 block text-sm font-semibold">Profile description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={3000} rows={7} className="w-full resize-none rounded-card border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600" placeholder="Tell customers about your store..." /></div>
            <div><label className="mb-1.5 block text-sm font-semibold">Custom store link</label><div className="flex overflow-hidden rounded-card border border-graphite-200"><span className="bg-cloud-100 px-3 py-2.5 text-sm text-graphite-500">/store/</span><input value={form.customUrl} onChange={(e) => setForm({ ...form, customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} maxLength={80} className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" placeholder={data.vendorProfile.storeSlug} /></div><p className="mt-1 text-xs text-graphite-500">Leave blank to keep your current store link.</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-semibold">Layout</label><select value={form.layout} onChange={(e) => setForm({ ...form, layout: e.target.value })} className="w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm"><option value="STANDARD">Standard</option><option value="EDITORIAL">Editorial</option><option value="CATALOG">Catalog</option></select></div><div><label className="mb-1.5 block text-sm font-semibold">Theme</label><select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} className="w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5 text-sm"><option value="CLASSIC">Classic</option><option value="DARK">Dark</option><option value="MINIMAL">Minimal</option></select></div></div>
            <div><label className="mb-1.5 block text-sm font-semibold">Accent color</label><div className="flex items-center gap-3"><input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded border border-graphite-200" /><input value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="w-36 rounded-card border border-graphite-200 px-3 py-2 text-sm" /></div></div>
            <button onClick={() => void save()} disabled={busy} className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />{busy ? "Saving…" : "Save profile"}</button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-card border border-graphite-200 bg-white p-5"><h2 className="font-bold text-graphite-900">Store badges</h2><p className="mt-1 text-sm text-graphite-600">Badges are granted by TTFL Store administration.</p><div className="mt-4"><StoreBadges badges={data.badges} /></div></section>
          <section className="rounded-card border border-graphite-200 bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-graphite-900">Gallery</h2><p className="mt-1 text-xs text-graphite-500">Up to 12 Enterprise images.</p></div><button onClick={() => inputRef.current?.click()} disabled={uploading || data.gallery.length >= 12} className="inline-flex items-center gap-1.5 rounded-card border border-graphite-200 px-3 py-2 text-xs font-semibold hover:border-ember-600 disabled:opacity-50"><ImagePlus className="h-4 w-4" />{uploading ? "Uploading…" : "Add image"}</button><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} className="hidden" /></div><div className="mt-4 grid grid-cols-2 gap-2">{data.gallery.map((image) => <div key={image.id} className="group relative aspect-square overflow-hidden rounded-card border border-graphite-200"><Image src={image.url} alt="Store gallery" fill sizes="160px" className="object-cover" /><button onClick={() => void remove(image.id)} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-ember-600 opacity-0 shadow-sm transition group-hover:opacity-100" aria-label="Remove gallery image"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div></section>
        </aside>
      </div>
    </div>
  );
}
