"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { ReviewCategoryRating } from "@/lib/api-types";

const CATEGORIES = [
  ["deliveryRating", "Delivery"],
  ["customerServiceRating", "Customer service"],
  ["productQualityRating", "Product quality"],
  ["descriptionAccuracyRating", "Description accuracy"],
  ["valueForMoneyRating", "Value for money"],
] as const;

type CategoryKey = typeof CATEGORIES[number][0];

export function StoreReviewForm({ productId, orderItemId, productName }: { productId: string; orderItemId: string; productName: string }) {
  const [rating, setRating] = useState(0);
  const [categories, setCategories] = useState<Record<CategoryKey, ReviewCategoryRating | null>>({
    deliveryRating: null, customerServiceRating: null, productQualityRating: null, descriptionAccuracyRating: null, valueForMoneyRating: null,
  });
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose(key: CategoryKey, value: ReviewCategoryRating) {
    setCategories((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setError(null);
    if (rating < 1) return setError("Choose an overall rating.");
    if (Object.values(categories).some((value) => !value)) return setError("Please rate every category.");
    setSaving(true);
    try {
      await api.post("/api/reviews", {
        productId, orderItemId, rating,
        comment: comment.trim() || undefined,
        ...categories,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your review.");
    } finally {
      setSaving(false);
    }
  }

  if (done) return <div className="mt-3 rounded-lg bg-verified-50 p-3 text-sm font-semibold text-verified-700">Thanks — your review has been submitted. Your feedback helps other customers understand this store's experience.</div>;

  return (
    <div className="mt-3 rounded-xl border border-graphite-200 bg-cloud-50 p-4 dark:border-graphite-700 dark:bg-graphite-950">
      <p className="text-sm font-bold text-graphite-900 dark:text-white">Review {productName}</p>
      <p className="mt-1 text-xs text-graphite-500">Rate the product and the store experience honestly.</p>
      <div className="mt-3 flex items-center gap-1">{[1,2,3,4,5].map((n) => <button key={n} type="button" aria-label={`${n} stars`} onClick={() => setRating(n)}><Star className={`h-5 w-5 ${n <= rating ? "fill-gold-600 text-gold-600" : "text-graphite-300"}`} /></button>)}</div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CATEGORIES.map(([key, label]) => <div key={key} className="rounded-lg border border-graphite-200 bg-white p-3 dark:border-graphite-700 dark:bg-graphite-900"><p className="text-xs font-semibold text-graphite-700 dark:text-graphite-200">{label}</p><div className="mt-2 flex gap-1.5">{(["EXCELLENT","GOOD","BAD"] as ReviewCategoryRating[]).map((value) => <button key={value} type="button" onClick={() => choose(key, value)} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${categories[key] === value ? value === "BAD" ? "border-ember-600 bg-ember-100 text-ember-700" : value === "GOOD" ? "border-gold-600 bg-gold-100 text-gold-700" : "border-verified-600 bg-verified-100 text-verified-700" : "border-graphite-200 text-graphite-500 dark:border-graphite-700"}`}>{value.charAt(0) + value.slice(1).toLowerCase()}</button>)}</div></div>)}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={3} placeholder="Tell other customers about your experience (optional)" className="mt-3 w-full rounded-lg border border-graphite-200 bg-white p-3 text-sm dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" />
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-ember-700">{error}</p>}
      <button type="button" disabled={saving} onClick={() => void submit()} className="mt-3 rounded-card bg-ember-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-ember-700 disabled:opacity-50">{saving ? "Submitting…" : "Submit review"}</button>
    </div>
  );
}
