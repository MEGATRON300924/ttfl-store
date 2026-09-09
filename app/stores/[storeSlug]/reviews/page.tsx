import { Star, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import type { ApiReview } from "@/lib/api-types";

type StoreReview = ApiReview & {
  product: { id: string; name: string; slug: string; images: { url: string }[] };
};

type StoreReviewsResponse = {
  store: { id: string; storeName: string; storeSlug: string; bio: string | null; location: string | null; logoUrl: string | null; verified: boolean };
  rating: number | null;
  reviewCount: number;
  items: StoreReview[];
};

export default async function StoreReviewsPage({ params }: { params: { storeSlug: string } }) {
  let data: StoreReviewsResponse;
  try {
    data = await api.get<StoreReviewsResponse>(`/api/reviews/store/${encodeURIComponent(params.storeSlug)}`);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-ember-600 hover:underline">← Back to TTFL Store</Link>

      <section className="mt-6 rounded-card border border-graphite-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {data.store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.store.logoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cloud-100 text-graphite-500"><Store className="h-7 w-7" /></div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-graphite-900">{data.store.storeName}</h1>
                {data.store.verified && <ShieldCheck className="h-5 w-5 text-ember-600" aria-label="Verified store" />}
              </div>
              {data.store.location && <p className="mt-1 text-sm text-graphite-500">{data.store.location}</p>}
              {data.store.bio && <p className="mt-2 max-w-2xl text-sm text-graphite-700">{data.store.bio}</p>}
            </div>
          </div>

          <div className="rounded-card bg-cloud-50 px-5 py-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-gold-600 text-gold-600" />
              <span className="text-xl font-bold text-graphite-900">{data.rating == null ? "—" : Number(data.rating).toFixed(1)}</span>
            </div>
            <p className="mt-1 text-xs text-graphite-500">{data.reviewCount} store review{data.reviewCount === 1 ? "" : "s"}</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-graphite-900">Customer reviews</h2>
        <p className="mt-1 text-sm text-graphite-500">Reviews from customers who purchased products from this store.</p>

        {data.items.length === 0 ? (
          <div className="mt-5 rounded-card border border-dashed border-graphite-200 p-10 text-center">
            <Store className="mx-auto h-8 w-8 text-graphite-300" />
            <p className="mt-3 font-semibold text-graphite-800">No reviews yet</p>
            <p className="mt-1 text-sm text-graphite-500">Be the first customer to share your experience.</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            {data.items.map((review) => (
              <article key={review.id} className="rounded-card border border-graphite-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= review.rating ? "fill-gold-600 text-gold-600" : "text-graphite-200"}`} />)}
                      </div>
                      <span className="text-sm font-semibold text-graphite-900">{review.customer.firstName} {review.customer.lastName.charAt(0)}.</span>
                    </div>
                    <p className="mt-1 text-xs text-graphite-400">{new Date(review.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
                  </div>
                  <Link href={`/products/${review.product.slug}`} className="text-right text-xs font-semibold text-ember-600 hover:underline">{review.product.name}</Link>
                </div>
                {review.comment && <p className="mt-4 text-sm leading-6 text-graphite-700">{review.comment}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
