"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { TextField } from "@/components/text-field";
import { ImageUploadField, type UploadedImage } from "@/components/image-upload-field";
import { VideoUploadField, type UploadedVideo } from "@/components/video-upload-field";
import { ProductSpecifications } from "@/components/product-specifications";
import type { ApiCategory } from "@/lib/api-types";

export function ComingSoonProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", categorySlug: "", availableAt: "", location: "", images: [] as UploadedImage[], videos: [] as UploadedVideo[], specifications: {} as Record<string, string> });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get<{ categories: ApiCategory[] }>("/api/categories").then((response) => { if (mounted) setCategories(response.categories); }).catch((err) => { if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load categories."); }).finally(() => { if (mounted) setLoadingCategories(false); });
    return () => { mounted = false; };
  }, []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function addTag() { const incoming = tagInput.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean); if (!incoming.length) return; setTags((current) => Array.from(new Set([...current, ...incoming])).slice(0, 20)); setTagInput(""); }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); if (form.name.trim().length < 3) return setError("Product name must be at least 3 characters."); if (form.description.trim().length < 10) return setError("Description must be at least 10 characters."); if (!form.categorySlug) return setError("Please choose a product category."); if (!form.images.length) return setError("Add at least one product image."); if (form.videos.length > 3) return setError("You can add up to 3 product videos."); setSubmitting(true);
    try {
      const response = await api.post<{ product: { id: string } }>("/api/products", { name: form.name.trim(), description: form.description.trim(), categorySlug: form.categorySlug, price: 0, condition: "NEW", stock: 0, location: form.location.trim() || undefined, images: form.images.map((image) => image.url).filter(Boolean), videos: form.videos.map((video) => video.url).filter(Boolean), tags, specifications: form.specifications, sellingMethod: "CHECKOUT", estimatedDeliveryDays: 7, comingSoon: true, availableAt: form.availableAt ? new Date(form.availableAt).toISOString() : null });
      await api.post(`/api/products/${response.product.id}/videos`, { videos: form.videos.map((video) => video.url).filter(Boolean) });
      router.push("/vendor/dashboard/launches");
    }
    catch (err) { setError(err instanceof ApiError ? err.message : "Something went wrong while creating the Coming Soon product."); setSubmitting(false); }
  }

  const selectedCategory = categories.find((category) => category.slug === form.categorySlug)?.name;
  return <form onSubmit={handleSubmit} className="flex flex-col gap-5">
    <div className="overflow-hidden rounded-card border border-graphite-200 bg-white dark:border-graphite-700 dark:bg-graphite-900">
      <div className="border-b border-graphite-200 bg-gradient-to-br from-ember-50 via-white to-gold-50 p-5 dark:border-graphite-700 dark:from-graphite-900 dark:via-graphite-900 dark:to-graphite-800"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-graphite-900 text-xl text-white">✦</div><div><p className="text-sm font-bold text-graphite-900 dark:text-white">Build anticipation</p><p className="text-xs text-graphite-600 dark:text-graphite-400">This product will appear as Coming Soon — not for sale yet.</p></div></div></div>
      <div className="flex flex-col gap-4 p-5">
        <TextField label="Product name" value={form.name} onChange={(value) => set("name", value)} />
        <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700 dark:text-graphite-300">Description</span><textarea rows={6} required value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell customers what is coming and why they should look forward to it." className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /></label>
        <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700 dark:text-graphite-300">Category</span><select required value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)} disabled={loadingCategories || categories.length === 0} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 disabled:cursor-not-allowed dark:border-graphite-700 dark:bg-graphite-900 dark:text-white"><option value="" disabled>{loadingCategories ? "Loading categories..." : "Choose a category"}</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select></label>
        <ProductSpecifications categoryName={selectedCategory} productName={form.name} specifications={form.specifications} onChange={(specifications) => set("specifications", specifications)} />
        <div className="grid gap-4 sm:grid-cols-2"><TextField label="Expected launch" type="datetime-local" value={form.availableAt} onChange={(value) => set("availableAt", value)} optional hint="Optional. You can also launch without publishing a date." /><TextField label="Location" value={form.location} onChange={(value) => set("location", value)} optional hint="e.g. Lagos, Abuja, Port Harcourt." /></div>
        <div className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700"><div className="text-sm font-medium text-graphite-700 dark:text-graphite-300">Search tags</div><div className="mt-3 flex gap-2"><input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} placeholder="e.g. new, launch, iPhone" className="min-w-0 flex-1 rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /><button type="button" onClick={addTag} className="rounded-[7px] border border-graphite-200 px-4 text-sm font-semibold dark:border-graphite-700">Add</button></div>{tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <button type="button" key={tag} onClick={() => setTags((current) => current.filter((item) => item !== tag))} className="rounded-full bg-cloud-100 px-3 py-1 text-xs dark:bg-graphite-800">{tag} ×</button>)}</div>}</div>
        <ImageUploadField images={form.images} onChange={(images) => set("images", images)} />
        <VideoUploadField videos={form.videos} onChange={(videos) => set("videos", videos)} />
      </div>
    </div>
    <div className="rounded-card border border-graphite-200 bg-cloud-50 p-4 dark:border-graphite-700 dark:bg-graphite-900"><div className="flex gap-3"><span className="text-lg">🚀</span><div><p className="text-sm font-semibold text-graphite-900 dark:text-white">No price needed</p><p className="mt-1 text-xs leading-5 text-graphite-600 dark:text-graphite-400">Coming Soon products do not need a price, stock quantity, delivery estimate, or purchase method yet. Those details can be added when the product is ready to launch.</p></div></div></div>
    {error && <p role="alert" className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
    <button type="submit" disabled={submitting || loadingCategories || !categories.length} className="rounded-card bg-graphite-900 py-3.5 text-sm font-semibold text-white hover:bg-graphite-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-graphite-900">{submitting ? "Creating…" : "Create Coming Soon product"}</button>
  </form>;
}
