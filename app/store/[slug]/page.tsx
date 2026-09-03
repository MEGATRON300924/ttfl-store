import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, MessageCircle, Store as StoreIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import { ProductCard } from "@/components/product-card";
import { StoreBadges, type StoreBadge } from "@/components/store-badges";

const SITE_URL = "https://ttflstore.name.ng";
const DEFAULT_SEO_IMAGE = "/ttflstore.png";

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
    const { store } = await api.get<{ store: PublicVendor }>(`/api/store-profile/public/${encodeURIComponent(slug)}`);
    return store;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    try {
      const response = await api.get<any>(`/api/vendors/store/${encodeURIComponent(slug)}`);
      const vendor = response.store ?? response.vendor ?? response.vendorProfile ?? response;
      if (!vendor?.storeName) return null;
      return {
        id: vendor.id,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        bio: vendor.bio ?? null,
        location: vendor.location ?? null,
        whatsappNumber: vendor.whatsappNumber ?? null,
        logoUrl: vendor.logoUrl ?? null,
        bannerUrl: vendor.bannerUrl ?? null,
        verified: Boolean(vendor.verified),
        tier: vendor.tier ?? "FREE",
        createdAt: vendor.createdAt ?? new Date().toISOString(),
        viewCount: Number(vendor.viewCount ?? 0),
        headline: null,
        description: null,
        theme: "CLASSIC",
        accentColor: "#E8622C",
        layout: "STANDARD",
        customUrl: null,
        productCount: Number(vendor.productCount ?? vendor._count?.products ?? 0),
        badges: vendor.badges ?? (vendor.verified ? ["VERIFIED"] : []),
        gallery: [],
      };
    } catch {
      return null;
    }
  }
}

async function getStoreProducts(slug: string): Promise<ApiProduct[]> {
  try {
    const { items } = await api.get<{ items: ApiProduct[] }>(`/api/products?vendor=${encodeURIComponent(slug)}&limit=48`);
    return items;
  } catch {
    return [];
  }
}

function cleanDescription(value: string | null, fallback: string) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  return (text || fallback).slice(0, 155);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vendor = await getVendor(params.slug);
  if (!vendor) return { title: "Store not found", description: "This store could not be found on TTFL Store.", openGraph: { title: "Store not found | TTFL Store", description: "This store could not be found on TTFL Store.", images: [{ url: DEFAULT_SEO_IMAGE, width: 1200, height: 630, alt: "TTFL Store" }] }, twitter: { card: "summary_large_image", images: [DEFAULT_SEO_IMAGE] } };
  const title = `${vendor.storeName} | TTFL Store`;
  const description = cleanDescription(vendor.description ?? vendor.bio, `Shop ${vendor.storeName} on TTFL Store.`);
  const image = vendor.bannerUrl || vendor.logoUrl || DEFAULT_SEO_IMAGE;
  const publicSlug = vendor.customUrl || vendor.storeSlug;
  const canonical = `${SITE_URL}/store/${publicSlug}`;
  return { title, description, alternates: { canonical }, openGraph: { type: "website", siteName: "TTFL Store", title, description, url: canonical, images: [{ url: image, width: 1200, height: 630, alt: `${vendor.storeName} on TTFL Store` }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  const vendor = await getVendor(params.slug);
  if (!vendor) notFound();
  const items = await getStoreProducts(vendor.storeSlug);
  const badges = Array.from(new Set([...(vendor.verified ? ["VERIFIED" as StoreBadge] : []), ...vendor.badges])) as StoreBadge[];
  const enterprise = badges.includes("ENTERPRISE") || vendor.tier === "ENTERPRISE";
  const dark = vendor.theme === "DARK";
  const surface = dark ? "bg-graphite-900 text-white" : "bg-white text-graphite-900";
  const muted = dark ? "text-graphite-200" : "text-graphite-600";

  return (
    <div className={dark ? "min-h-screen bg-graphite-950" : "min-h-screen bg-cloud-50"}>
      <div className="shell py-5 sm:py-8">
        <div className={`overflow-hidden rounded-card border border-graphite-200 ${surface}`}>
          {vendor.bannerUrl ? <div className="relative h-36 w-full sm:h-56"><Image src={vendor.bannerUrl} alt="" fill sizes="100vw" className="object-cover" priority /></div> : <div className="h-24 w-full sm:h-32" style={vendor.theme === "MINIMAL" ? undefined : { backgroundColor: vendor.accentColor }} />}
          <div className="relative px-4 pb-5 sm:px-8 sm:pb-7">
            <div className="-mt-7 flex flex-col gap-3 sm:-mt-9 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-end">
                {vendor.logoUrl ? <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-card sm:h-20 sm:w-20"><Image src={vendor.logoUrl} alt={`${vendor.storeName} logo`} fill sizes="80px" className="object-cover" /></div> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-white bg-graphite-900 text-xl font-bold text-white shadow-card sm:h-20 sm:w-20">{vendor.storeName.charAt(0).toUpperCase()}</div>}
                <div className="min-w-0"><h1 className="truncate text-xl font-bold sm:text-2xl">{vendor.storeName}</h1><div className="mt-1.5"><StoreBadges badges={badges} /></div>{vendor.location && <p className={`mt-1.5 flex items-center gap-1.5 text-sm ${muted}`}><MapPin className="h-4 w-4" />{vendor.location}</p>}</div>
              </div>
              {vendor.whatsappNumber && <a href={`https://wa.me/${vendor.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-card bg-verified-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-verified-700 sm:w-auto"><MessageCircle className="h-4 w-4" />Contact store</a>}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]"><div>{vendor.headline && <p className="text-lg font-semibold">{vendor.headline}</p>}<p className={`mt-1 max-w-3xl text-sm leading-6 ${muted}`}>{vendor.description ?? vendor.bio ?? "Welcome to our TTFL Store."}</p></div><div className={`flex gap-5 text-sm ${muted}`}><span><strong className={dark ? "text-white" : "text-graphite-900"}>{vendor.productCount}</strong> products</span><span><strong className={dark ? "text-white" : "text-graphite-900"}>{vendor.viewCount}</strong> visits</span></div></div>
          </div>
        </div>
        {enterprise && vendor.gallery.length > 0 && <section className="mt-7 sm:mt-8"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-wide text-ember-600">Store gallery</p><h2 className={`mt-1 text-xl font-bold ${dark ? "text-white" : "text-graphite-900"}`}>Inside {vendor.storeName}</h2></div><div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">{vendor.gallery.map((image) => <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-card border border-graphite-200 bg-white"><Image src={image.url} alt={`${vendor.storeName} gallery`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>)}</div></section>}
        <div className="mt-7 flex items-center gap-2 sm:mt-8"><StoreIcon className="h-5 w-5 text-ember-600" /><h2 className={`text-xl font-bold ${dark ? "text-white" : "text-graphite-900"}`}>Products from this store</h2></div>
        {items.length === 0 ? <div className="mt-4 rounded-card border border-dashed border-graphite-200 p-8 text-center text-sm text-graphite-600">This store hasn't listed any products yet.</div> : <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={{ id: p.id, slug: p.slug, name: p.name, price: Number(p.price), previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined, image: p.images[0]?.url ?? "", vendor: p.vendor.storeName, vendorSlug: p.vendor.storeSlug, verified: p.vendor.verified, location: p.location ?? "", rating: 0, reviewCount: 0, sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout" }} />)}</div>}
      </div>
    </div>
  );
}
