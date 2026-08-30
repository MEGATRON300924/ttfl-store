"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { TextField } from "@/components/text-field";
import type { ApiCategory } from "@/lib/api-types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[] | null>(null);
  const [form, setForm] = useState({ name: "", icon: "", parentSlug: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { categories } = await api.get<{ categories: ApiCategory[] }>("/api/categories");
    setCategories(categories);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/categories", {
        name: form.name,
        icon: form.icon || undefined,
        parentSlug: form.parentSlug || undefined,
      });
      setForm({ name: "", icon: "", parentSlug: "" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create category");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell max-w-2xl py-8">
      <h1 className="text-xl font-bold text-graphite-900">Categories</h1>
      <p className="mt-1 text-sm text-graphite-600">
        Products can only be assigned to a category that exists here — this is where you create them.
      </p>

      <form onSubmit={create} className="mt-6 flex flex-col gap-4 rounded-card border border-graphite-200 p-4">
        <TextField label="Category name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <TextField
          label="Icon name (optional — a lucide-react icon name, e.g. Smartphone)"
          value={form.icon}
          onChange={(v) => setForm({ ...form, icon: v })}
          optional
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-graphite-700">Parent category (optional — leave blank for a top-level category)</span>
          <select
            value={form.parentSlug}
            onChange={(e) => setForm({ ...form, parentSlug: e.target.value })}
            className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">None — top-level category</option>
            {categories
              ?.filter((c) => !c.children || c.children.length >= 0)
              .map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>

        {error && <p className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-card bg-ember-600 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create category"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {categories === null ? (
          <p className="text-sm text-graphite-600">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-graphite-600">
            No categories yet — create one above. Vendors can't assign a category to a product until at least
            one exists.
          </p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="rounded-card border border-graphite-200 p-3">
              <p className="text-sm font-semibold text-graphite-900">{c.name}</p>
              {c.children && c.children.length > 0 && (
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {c.children.map((child) => (
                    <li key={child.id} className="rounded-tag bg-cloud-100 px-2 py-1 text-xs text-graphite-700">
                      {child.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
