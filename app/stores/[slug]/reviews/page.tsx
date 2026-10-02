import Link from "next/link";
import Image from "next/image";
import { Star, ArrowLeft, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

export default async function StoreReviewsPage({ params }: { params: { slug: string } }) {
  let data: any;
  try { data = await api.get<any>(`/api/reviews/store/${encodeURIComponent(params.slug)}?page=1&limit=50`); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const average = Number(data.rating ?? 0);
  return <main className="min-h-screen bg-cloud-50 text-graphite-900"><div className="shell py-6 sm:py-10">
    <Link href={`/store/${encodeURIComponent(data.store.storeSlug)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-600 hover:text-ember-600"><ArrowLeft className="h-4 w-4"/> Back to {data.store.storeName}</Link>
    <section className="mt-5 rounded-[28px] border border-graphite-200 bg-white p-5 shadow-card sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">{data.store.logoUrl ? <div className="relative h-16 w-16 overflow-hidden rounded-2xl"><Image src={data.store.logoUrl} alt={data.store.storeName} fill sizes="64px" className="object-cover"/></div> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-graphite-900 text-xl font-bold text-white">{data.store.storeName.charAt(0)}</div>}<div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold">{data.store.storeName}</h1>{data.store.verified && <ShieldCheck className="h-5 w-5 text-verified-600"/>}</div><p className="mt-1 text-sm text-graphite-500">Customer reviews</p></div></div>
      <div className="rounded-2xl bg-cloud-50 p-4"><div className="flex items-center gap-3"><span className="text-3xl font-bold">{average ? average.toFixed(1) : "—"}</span><span className="inline-flex text-gold-500">{[1,2,3,4,5].map(n=><Star key={n} className={`h-4 w-4 ${n<=Math.round(average)?"fill-current":""}`}/>)}</span></div><p className="mt-1 text-xs text-graphite-500">{Number(data.reviewCount??0).toLocaleString()} published reviews</p></div>
    </div></section>
    {data.items?.length ? <section className="mt-6 space-y-3">{data.items.map((review:any)=><article key={review.id} className="rounded-2xl border border-graphite-200 bg-white p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-3"><span className="inline-flex text-gold-500">{[1,2,3,4,5].map(n=><Star key={n} className={`h-4 w-4 ${n<=review.rating?"fill-current":""}`}/>)}</span><span className="text-sm font-semibold">{review.customer.firstName} {review.customer.lastName?.charAt(0)}.</span></div><p className="mt-1 text-xs text-graphite-500">{new Date(review.createdAt).toLocaleDateString("en-NG")}</p></div><Link href={`/products/${review.product.slug}`} className="text-sm font-semibold text-ember-600 hover:underline">{review.product.name}</Link></div>{review.comment && <p className="mt-4 text-sm leading-6 text-graphite-700">{review.comment}</p>}</article>)}</section> : <section className="mt-6 rounded-2xl border border-dashed border-graphite-200 bg-white p-10 text-center"><Star className="mx-auto h-8 w-8 text-graphite-300"/><h2 className="mt-3 font-bold">No customer reviews yet</h2><p className="mt-1 text-sm text-graphite-500">Reviews will appear here after verified customers review their delivered purchases.</p></section>}
  </div></main>;
}