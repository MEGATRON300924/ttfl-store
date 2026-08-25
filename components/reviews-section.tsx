"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { ApiReview, ApiOrder } from "@/lib/api-types";

export function ReviewsSection({
  productId,
  avgRating,
  reviewCount,
}: {
  productId: string;
  avgRating: number | null;
  reviewCount: number;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ApiReview[] | null>(null);
  const [eligibleOrderItemId, setEligibleOrderItemId] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get<{ items: ApiReview[] }>(`/api/reviews/product/${productId}`).then((r) => setReviews(r.items));
  }, [productId]);

  // Find a paid order item for this product to determine review
  // eligibility — a customer can only review something they've actually
  // bought and paid for (enforced server-side too; this is just so the UI
  // doesn't show a form that would fail on submit).
  useEffect(() => {
    if (!user) return;
    api.get<{ orders: ApiOrder[] }>("/api/orders/me").then(({ orders }) => {
      for (const order of orders) {
        if (order.paymentStatus !== "PAID") continue;
        for (const vo of order.vendorOrders) {
          const item = vo.items.find((i) => i.productId === productId);
          if (item) {
            setEligibleOrderItemId(item.id);
            return;
          }
        }
      }
    });
  }, [user, productId]);

  useEffect(() => {
    if (user && reviews) {
      setAlreadyReviewed(reviews.some((r) => `${r.customer.firstName} ${r.customer.lastName}` === `${user.firstName} ${user.lastName}`));
    }
  }, [user, reviews]);

  return (
    <section className="mt-10 border-t border-graphite-200 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-graphite-900">Reviews</h2>
          {reviewCount > 0 ? (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-graphite-700">
              <Star className="h-4 w-4 fill-gold-600 text-gold-600" />
              <span className="font-semibold">{Number(avgRating).toFixed(1)}</span>
              <span className="text-graphite-400">({reviewCount} review{reviewCount === 1 ? "" : "s"})</span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-graphite-600">No reviews yet</p>
          )}
        </div>

        {eligibleOrderItemId && !alreadyReviewed && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-card border border-graphite-300 px-4 py-2 text-sm font-semibold text-graphite-900 hover:bg-cloud-100"
          >
            {showForm ? "Cancel" : "Write a review"}
          </button>
        )}
      </div>

      {showForm && eligibleOrderItemId && (
        <ReviewForm
          productId={productId}
          orderItemId={eligibleOrderItemId}
          onSubmitted={(review) => {
            setReviews((prev) => [review, ...(prev ?? [])]);
            setAlreadyReviewed(true);
            setShowForm(false);
          }}
        />
      )}

      <div className="mt-6 flex flex-col gap-5">
        {reviews === null ? (
          <p className="text-sm text-graphite-600">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-graphite-600">Be the first to review this product.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border-b border-graphite-100 pb-5 last:border-0">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-gold-600 text-gold-600" : "text-graphite-200"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-graphite-900">
                  {r.customer.firstName} {r.customer.lastName.charAt(0)}.
                </span>
                <span className="text-xs text-graphite-400">
                  {new Date(r.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </span>
              </div>
              {r.comment && <p className="mt-1.5 text-sm text-graphite-700">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ReviewForm({
  productId,
  orderItemId,
  onSubmitted,
}: {
  productId: string;
  orderItemId: string;
  onSubmitted: (review: ApiReview) => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const { review } = await api.post<{ review: Omit<ApiReview, "customer"> }>("/api/reviews", {
        productId,
        orderItemId,
        rating,
        comment: comment || undefined,
      });
      onSubmitted({
        ...review,
        customer: { firstName: user?.firstName ?? "You", lastName: user?.lastName ?? "" },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-card border border-graphite-200 p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star className={`h-6 w-6 ${n <= rating ? "fill-gold-600 text-gold-600" : "text-graphite-200"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product (optional)"
        rows={3}
        className="mt-3 w-full rounded-[7px] border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-ember-600"
      />
      {error && <p className="mt-2 text-sm text-ember-600">{error}</p>}
      <button
        onClick={submit}
        disabled={submitting}
        className="mt-3 rounded-card bg-ember-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
