import { Star, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import type { ApiReview } from "@/lib/api-types";
import { StoreReviewSection } from "@/components/store-review-section";

type StoreReview = ApiReview & {
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string }[];
  };
};

type StoreInfo = {
  id: string;
  storeName: string;
  storeSlug: string;
  bio: string | null;
  location: string | null;
  logoUrl: string | null;
  verified: boolean;
};

type StoreReviewsResponse = {
  store: StoreInfo;
  rating: number | null;
  reviewCount: number;
  items: StoreReview[];
};

async function getStoreReviews(storeSlug: string): Promise<StoreReviewsResponse> {
  try {
    return await api.get<StoreReviewsResponse>(
      `/api/reviews/store/${encodeURIComponent(storeSlug)}?page=1&limit=50`,
    );
  } catch (error) {
    // The reviews page should still render when the reviews collection is
    // temporarily unavailable. Confirm the store through the public profile.
    try {
      const response = await api.get<{ store: StoreInfo }>(
        `/api/store-profile/public/${encodeURIComponent(storeSlug)}`,
      );
      return {
        store: response.store,
        rating: null,
        reviewCount: 0,
        items: [],
      };
    } catch {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }
  }
}

export default async function StoreReviewsPage({
  params,
}: {
  params: { storeSlug: string };
}) {
  const data = await getStoreReviews(params.storeSlug);

  return (
    <main className="min-h-screen bg-cloud-50 text-graphite-900">
      <div className="shell py-6 sm:py-10">
        <Link
          href={`/store/${encodeURIComponent(data.store.storeSlug)}`}
          className="text-sm font-semibold text-graphite-600 hover:text-ember-600"
        >
          ← Back to {data.store.storeName}
        </Link>

        <section className="mt-5 rounded-[28px] border border-graphite-200 bg-white p-5 shadow-card sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {data.store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.store.logoUrl}
                  alt={data.store.storeName}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-graphite-900 text-xl font-bold text-white">
                  {data.store.storeName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{data.store.storeName}</h1>
                  {data.store.verified && (
                    <ShieldCheck
                      className="h-5 w-5 text-verified-600"
                      aria-label="Verified store"
                    />
                  )}
                </div>
                <p className="mt-1 text-sm text-graphite-500">
                  Customer reviews
                </p>
                {data.store.location && (
                  <p className="mt-1 text-xs text-graphite-400">
                    {data.store.location}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-cloud-50 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">
                  {data.rating == null ? "—" : Number(data.rating).toFixed(1)}
                </span>
                <span className="inline-flex text-gold-600">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${data.rating != null && n <= Math.round(Number(data.rating)) ? "fill-current" : ""}`}
                    />
                  ))}
                </span>
              </div>
              <p className="mt-1 text-xs text-graphite-500">
                {data.reviewCount.toLocaleString()} published review
                {data.reviewCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-bold">Customer reviews</h2>
          <p className="mt-1 text-sm text-graphite-500">
            Reviews from customers who purchased products from this store.
          </p>

          {data.items.length === 0 ? (
            <div className="mt-5 rounded-card border border-dashed border-graphite-200 bg-white p-10 text-center">
              <Store className="mx-auto h-8 w-8 text-graphite-300" />
              <p className="mt-3 font-semibold text-graphite-800">
                No reviews yet
              </p>
              <p className="mt-1 text-sm text-graphite-500">
                Be the first customer to share your experience.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              {data.items.map((review) => (
                <article
                  key={review.id}
                  className="rounded-card border border-graphite-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex"
                          aria-label={`${review.rating} out of 5 stars`}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`h-4 w-4 ${n <= review.rating ? "fill-gold-600 text-gold-600" : "text-graphite-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold">
                          {review.customer.firstName}{" "}
                          {review.customer.lastName.charAt(0)}.
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-graphite-400">
                        {new Date(review.createdAt).toLocaleDateString("en-NG", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>

                    <Link
                      href={`/products/${review.product.slug}`}
                      className="text-sm font-semibold text-ember-600 hover:underline"
                    >
                      {review.product.name}
                    </Link>
                  </div>

                  {review.comment && (
                    <p className="mt-4 text-sm leading-6 text-graphite-700">
                      {review.comment}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      ["Delivery", review.deliveryRating],
                      ["Customer service", review.customerServiceRating],
                      ["Product quality", review.productQualityRating],
                      ["Description accuracy", review.descriptionAccuracyRating],
                      ["Value for money", review.valueForMoneyRating],
                    ].map(([label, value]) =>
                      value ? (
                        <span
                          key={label}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            value === "BAD"
                              ? "bg-ember-100 text-ember-700"
                              : value === "GOOD"
                                ? "bg-gold-100 text-gold-700"
                                : "bg-verified-100 text-verified-700"
                          }`}
                        >
                          {label}: {String(value).toLowerCase().replace("_", " ")}
                        </span>
                      ) : null,
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <StoreReviewSection storeSlug={data.store.storeSlug} />
      </div>
    </main>
  );
}
