"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MessageSquare, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { StoreReviewForm } from "@/components/store-review-form";

type EligibleItem = {
  orderItemId: string;
  orderNumber: string;
  deliveredAt: string;
  product: { id: string; name: string; slug: string; image: string | null };
};

export function StoreReviewSection({ storeSlug }: { storeSlug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<EligibleItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    setLoading(true);

    api
      .get<{ items: EligibleItem[] }>(
        `/api/reviews/store/${encodeURIComponent(storeSlug)}/eligible`,
      )
      .then((response) => {
        if (!cancelled) setItems(response.items);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, storeSlug]);

  if (authLoading || (user && loading)) {
    return (
      <section id="give-review" className="mt-6 rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm text-graphite-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking review eligibility…
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section id="give-review" className="mt-6 rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-ember-600" />
          <div>
            <h2 className="font-bold text-graphite-900">Give a review</h2>
            <p className="mt-1 text-sm leading-6 text-graphite-600">
              Sign in to review a product you bought from this store after it has been delivered.
            </p>
            <Link
              href={`/login?next=${encodeURIComponent(`/stores/${storeSlug}/reviews#give-review`)}`}
              className="mt-4 inline-flex rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
            >
              Sign in to give a review
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section id="give-review" className="mt-6 rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-ember-600" />
          <div>
            <h2 className="font-bold text-graphite-900">Give a review</h2>
            <p className="mt-1 text-sm leading-6 text-graphite-600">
              You don't have a delivered purchase from this store waiting for a review.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="give-review" className="mt-6 rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="font-bold text-graphite-900">Give a review</h2>
        <p className="mt-1 text-sm text-graphite-500">
          Choose a delivered purchase below and share your experience.
        </p>
      </div>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.orderItemId}>
            <div className="flex items-center justify-between gap-3 text-xs text-graphite-500">
              <span>Order {item.orderNumber}</span>
              <span>Delivered</span>
            </div>
            <StoreReviewForm
              productId={item.product.id}
              orderItemId={item.orderItemId}
              productName={item.product.name}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
