import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, MessageCircle, Store as StoreIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import { ProductCard } from "@/components/product-card";
import { StoreBadges, type StoreBadge } from "@/components/store-badges";

type PublicVendor = {
  id: string;
  storeName: string;
  storeSlug: string;
  bio: string | null;
  location: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  verified: boolean;
  tier: string;
  createdAt: string;
  viewCount: number;
  headline: string | null;
  description: string | null;
  theme: "CLASSIC" | "DARK" | "MINIMAL";
  accentColor: string;
  layout: "STANDARD" | "EDITORIAL" | "CATALOG";
  customUrl: string | null;
  productCount: number;
  badges: StoreBadge[];
  gallery: { id: string; url: string; position: number }[];
};

async function getVendor(slug: string): Promise<PublicVendor | null> {
  try {
    const { store } = await api.get<{ store: PublicVendor }>(`/api/store-profile/public/${slug}`);
    return store;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function getStoreProducts(slug: string) {
  return api.get<{ items: ApiProduct[] }>(`/api/products?vendor=${slug}&limit=48`);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vendor = await getVendor(params.slug);
  if (!vendor) return { title: "Store not found" };
  return {
    title: `${vendor.storeName} | TTFL Store`,
    description: vendor.description ?? vendor.bio ?? `Shop ${vendor.storeName} on TTFL Store.`,
    alternates: { canonical: `/store/${vendor.storeSlug}` },
  };
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  const vendor = await getVendor(params.slug);
  if (!vendor) notFound();
  const { items } = await getStoreProducts(params.slug);
  const badges = vendor.badges.includes("VERIFIED") || vendor.verified
    ? Array.from(new Set(["VERIFIED", ...vendor.badges])) as StoreBadge[]
    : vendor.badges;
  const enterprise = badges.includes("ENTERPRISE") || vendor.tier === "ENTERPRISE";
  const dark = vendor.theme === "DARK";
  const surface = dark ? "bg-graphite-900 text-white" : "bg-white text-graphite-900";
  const muted = dark ? "text-graphite-200" : "text-graphite-600";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: vendor.storeName,
    url: `https://ttflstore.name.ng/store/${vendor.storeSlug}`,
    logo: vendor.logoUrl ?? undefined,
    description: vendor.description ?? vendor.bio ?? undefined,
  };

  return (
    <div className={dark ? "min-h-screen bg-graphite-950" : "min-h-screen bg-cloud-50"}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="shell py-6 sm:py-8">
        <div className={`overflow-hidden rounded-card border border-graphite-200 ${surface}`}>
          {vendor.bannerUrl ? (
            <div className="relative h-40 w-full sm:h-56">
              <Image src={vendor.bannerUrl} alt="" fill sizes="100vw" className="object-cover" priority />
            </div>
          ) : (
            <div className="h-24 w-full bg-cloud-100 sm:h-32" style={vendor.theme === "MINIMAL" ? undefined : { backgroundColor: vendor.accentColor }} />
          )}

          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
                {vendor.logoUrl ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-card sm:h-24 sm:w-24">
                    <Image src={vendor.logoUrl} alt={`${vendor.storeName} logo`} fill sizes="96px" className="object-cover" />
                  </div>
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-white bg-graphite-900 text-2xl font-bold text-white shadow-card sm:h-24 sm:w-24">
                    {vendor.storeName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold sm:text-3xl">{vendor.storeName}</h1>
                  </div>
                  <div className="mt-2"><StoreBadges badges={badges} /></div>
                  {vendor.location && <p className={`mt-2 flex items-center gap-1.5 text-sm ${muted}`}><MapPin className="h-4 w-4" />{vendor.location}</p>}
                </div>
              </div>

              {vendor.whatsappNumber && (
                <a href={`https://wa.me/${vendor.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-card bg-verified-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-verified-700">
                  <MessageCircle className="h-4 w-4" /> Contact store
                </a>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                {vendor.headline && <p className="text-lg font-semibold">{vendor.headline}</p>}
                <p className={`mt-1 max-w-3xl text-sm leading-6 ${muted}`}>{vendor.description ?? vendor.bio ?? "Welcome to our TTFL Store."}</p>
              </div>
              <div className={`flex gap-5 text-sm ${muted}`}>
                <span><strong className={dark ? "text-white" : "text-graphite-900"}>{vendor.productCount}</strong> products</span>
                <span><strong className={dark ? "text-white" : "text-graphite-900"}>{vendor.viewCount}</strong> visits</span>
              </div>
            </div>
          </div>
        </div>

        {enterprise && vendor.gallery.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-ember-600">Store gallery</p><h2 className={`mt-1 text-xl font-bold ${dark ? "text-white" : "text-graphite-900"}`}>Inside {vendor.storeName}</h2></div>
              <span className="text-xs text-graphite-500">Enterprise profile</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {vendor.gallery.map((image) => (
                <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-card border border-graphite-200 bg-white">
                  <Image src={image.url} alt={`${vendor.storeName} gallery`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-ember-600" />
          <h2 className={`text-xl font-bold ${dark ? "text-white" : "text-graphite-900"}`}>Products from this store</h2>
        </div>
        {items.length === 0 ? (
          <div className="mt-4 rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">This store hasn't listed any products yet.</div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={{ id: p.id, slug: p.slug, name: p.name, price: Number(p.price), previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined, image: p.images[0]?.url ?? "", vendor: p.vendor.storeName, vendorSlug: p.vendor.storeSlug, verified: p.vendor.verified, location: p.location ?? "", rating: 0, reviewCount: 0, sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
