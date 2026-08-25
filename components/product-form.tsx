"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { TextField } from "@/components/text-field";
import { ImageUploadField, type UploadedImage } from "@/components/image-upload-field";
import type { ApiCategory, SellingMethod, ProductCondition } from "@/lib/api-types";

export type ProductFormValues = {
  name: string;
  description: string;
  categorySlug: string;
  price: string;
  previousPrice: string;
  condition: ProductCondition;
  stock: string;
  location: string;
  images: UploadedImage[];
  sellingMethod: SellingMethod;
  externalUrl: string;
  whatsappNumber: string;
};

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  categorySlug: "",
  price: "",
  previousPrice: "",
  condition: "NEW",
  stock: "1",
  location: "",
  images: [],
  sellingMethod: "CHECKOUT",
  externalUrl: "",
  whatsappNumber: "",
};

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [form, setForm] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<{ categories: ApiCategory[] }>("/api/categories").then((r) => setCategories(r.categories));
  }, []);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const images = form.images.map((img) => img.url);

    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      categorySlug: form.categorySlug,
      price: Number(form.price),
      previousPrice: form.previousPrice ? Number(form.previousPrice) : undefined,
      condition: form.condition,
      stock: Number(form.stock),
      location: form.location || undefined,
      images,
      sellingMethod: form.sellingMethod,
    };
    if (form.sellingMethod === "EXTERNAL_LINK") payload.externalUrl = form.externalUrl;
    if (form.sellingMethod === "WHATSAPP" && form.whatsappNumber) payload.whatsappNumber = form.whatsappNumber;

    try {
      if (productId) {
        await api.patch(`/api/products/${productId}`, payload);
      } else {
        await api.post("/api/products", payload);
      }
      router.push("/vendor/dashboard/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField label="Product name" value={form.name} onChange={(v) => set("name", v)} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-graphite-700">Description</span>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="rounded-[7px] border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-graphite-700">Category</span>
        <select
          required
          value={form.categorySlug}
          onChange={(e) => set("categorySlug", e.target.value)}
          className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600"
        >
          <option value="" disabled>
            Choose a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Price (₦)" type="number" value={form.price} onChange={(v) => set("price", v)} />
        <TextField
          label="Previous price (optional, for discount)"
          type="number"
          value={form.previousPrice}
          onChange={(v) => set("previousPrice", v)}
          optional
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-graphite-700">Condition</span>
          <select
            value={form.condition}
            onChange={(e) => set("condition", e.target.value as ProductCondition)}
            className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600"
          >
            <option value="NEW">New</option>
            <option value="USED">Used</option>
          </select>
        </label>
        <TextField label="Stock" type="number" value={form.stock} onChange={(v) => set("stock", v)} />
      </div>

      <TextField label="Location (optional)" value={form.location} onChange={(v) => set("location", v)} optional />

      <ImageUploadField images={form.images} onChange={(images) => set("images", images)} />
      {form.images.length === 0 && (
        <p className="text-xs text-ember-600">Add at least one product photo.</p>
      )}

      <fieldset className="rounded-card border border-graphite-200 p-4">
        <legend className="px-1 text-sm font-semibold text-graphite-900">How do customers buy this?</legend>
        <div className="mt-2 flex flex-col gap-2">
          {(
            [
              { value: "CHECKOUT", label: "TTFL Store checkout — customer pays through the site" },
              { value: "EXTERNAL_LINK", label: "External link — send them to my own website" },
              { value: "WHATSAPP", label: "WhatsApp — chat to close the sale" },
            ] as const
          ).map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-graphite-700">
              <input
                type="radio"
                name="sellingMethod"
                checked={form.sellingMethod === opt.value}
                onChange={() => set("sellingMethod", opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {form.sellingMethod === "EXTERNAL_LINK" && (
          <div className="mt-3">
            <TextField
              label="Product URL on your website"
              value={form.externalUrl}
              onChange={(v) => set("externalUrl", v)}
            />
          </div>
        )}
        {form.sellingMethod === "WHATSAPP" && (
          <div className="mt-3">
            <TextField
              label="WhatsApp number for this product (optional — defaults to your store number)"
              value={form.whatsappNumber}
              onChange={(v) => set("whatsappNumber", v)}
              optional
            />
          </div>
        )}
      </fieldset>

      {error && <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-card bg-ember-600 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
      >
        {submitting ? "Saving…" : productId ? "Save changes" : "List product"}
      </button>
    </form>
  );
}
