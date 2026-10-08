import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Eye, MapPin, ShieldCheck, Sparkles, Star, Store as StoreIcon, AlertTriangle, ShieldAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import { ProductCard } from "@/components/product-card";
import { StoreBadges, type StoreBadge } from "@/components/store-badges";
import { StoreProfileActions } from "@/components/store-profile-actions";
import { StoreBuilderEntry } from "@/components/store-builder-entry";

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
  bookingSettings?: { enabled: boolean; bookingUrl: string | null; bookingLabel: string | null; whatsappNumber: string | null; phoneNumber: string | null; email: string | null; instructions: string | null };
  reviewHealth?: { windowDays: number; recentReviews: number; recentOrders: number; problemOrders: number; badReviews: number; caution: boolean; threshold: number }; businessHours?: {dayOfWeek:number;day:string;isOpen:boolean;openTime:string|null;closeTime:string|null}[]; openNow?: boolean;
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

function formatCount(value: number) {
  return new Intl.NumberFormat("en-NG", { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function WhatsAppLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
      <path d="M16 3.2A12.8 12.8 0 0 0 5 22.4L3.2 28.8l6.6-1.7A12.8 12.8 0 1 0 16 3.2Zm0 23.3a10.4 10.4 0 0 1-5.3-1.45l-.38-.23-3.9 1 1.04-3.78-.25-.39A10.4 10.4 0 1 1 16 26.5Zm5.72-7.72c-.31-.16-1.83-.9-2.11-1-.29-.1-.5-.16-.71.16-.21.31-.81 1-1 1.2-.18.21-.37.23-.68.08-.31-.16-1.31-.48-2.5-1.52-.92-.8-1.54-1.78-1.72-2.08-.18-.31-.02-.48.14-.64.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.76.75.32 1.34.52 1.8.67.76.24 1.45.21 2 .13.61-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.21-.6-.37Z"/>
    </svg>
  );
}

function getDisplayBadges(vendor: PublicVendor): StoreBadge[] {
  const badges = new Set<StoreBadge>(vendor.badges ?? []);
  if (vendor.verified) badges.add("VERIFIED");
  if (vendor.tier === "BUSINESS") badges.add("BUSINESS");
  if (vendor.tier === "ENTERPRISE") {
    badges.add("ENTERPRISE");
    badges.add("PLATINUM");
  }
  return Array.from(badges);
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
  const badges = getDisplayBadges(vendor);
  const enterprise = badges.includes("ENTERPRISE") || vendor.tier === "ENTERPRISE";
  const dark = vendor.theme === "DARK";
  const accent = vendor.theme === "MINIMAL" ? "#111827" : vendor.accentColor || "#E8622C";
  const publicSlug = vendor.customUrl || vendor.storeSlug;
  const storeUrl = SITE_URL + "/store/" + publicSlug;
  const muted = dark ? "text-graphite-300" : "text-graphite-600";
  const panel = dark ? "border-white/10 bg-graphite-900" : "border-graphite-200 bg-white";
  const storefront = vendor.storefront;
  const banner = storefront?.banner;
  const sectionEnabled = (type: string) => storefront?.sections?.some((section: any) => section.type === type && section.enabled) ?? true;

  return (
    <main className={dark ? "min-h-screen bg-graphite-950 text-white" : "min-h-screen bg-cloud-50 text-graphite-900"}>
      <div className="shell py-5 sm:py-8">
        <section className={"overflow-hidden rounded-[28px] border shadow-card " + panel}>
          <div className="relative" style={{height: `${Math.max(220, Math.min(520, Number(banner?.height ?? 288)))}px`}}>
            {(banner?.imageUrl || vendor.bannerUrl) ? <Image src={banner?.imageUrl || vendor.bannerUrl || ""} alt="" fill sizes="100vw" className="object-cover" style={{objectPosition: `${Number(banner?.positionX ?? 50)}% ${Number(banner?.positionY ?? 50)}%`}} priority /> : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, " + accent + ", " + (dark ? "#111827" : "#1F2937") + ")" }} />}
            <div className="absolute inset-0 bg-black" style={{opacity:Number(banner?.overlay ?? 35)/100}} />
            <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6"><StoreBuilderEntry storeSlug={vendor.storeSlug} /><StoreProfileActions storeName={vendor.storeName} url={storeUrl} whatsappNumber={vendor.whatsappNumber} /></div>
            <div className="absolute bottom-5 left-4 right-4 sm:bottom-7 sm:left-7 sm:right-7"><div className="flex min-w-0 items-end gap-4">
              {vendor.logoUrl ? <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-24 sm:w-24"><Image src={vendor.logoUrl} alt={vendor.storeName + " logo"} fill sizes="96px" className="object-cover" /></div> : <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-graphite-900 text-2xl font-bold text-white shadow-lg sm:h-24 sm:w-24">{vendor.storeName.charAt(0).toUpperCase()}</div>}
              <div className="min-w-0 text-white"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{banner?.title || vendor.storeName}</h1>{vendor.verified && <ShieldCheck className="h-5 w-5 shrink-0" aria-label="Verified store" />}</div>
                {(banner?.subtitle || vendor.headline) && <p className="mt-1 max-w-2xl text-sm font-medium text-white/90 sm:text-base">{banner?.subtitle || vendor.headline}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/85 sm:text-sm">{vendor.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{vendor.location}</span>}<span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-current" />{"See customer reviews"}</span></div>
              </div>
            </div></div>
          </div>
          <div className="px-4 pb-5 pt-5 sm:px-7 sm:pb-7">
            <div className="flex flex-wrap items-center gap-2"><StoreBadges badges={badges} />{vendor.tier !== "FREE" && <span className="rounded-full border border-graphite-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-graphite-500">{vendor.tier} store</span>}</div>
            <div className="mt-4 rounded-xl border border-graphite-200 p-4 dark:border-graphite-700"><div className="flex items-center justify-between"><p className="text-sm font-bold">Business hours</p><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${vendor.openNow ? "bg-verified-100 text-verified-700" : "bg-graphite-100 text-graphite-600"}`}>{vendor.openNow ? "Open now" : "Closed now"}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">{(vendor.businessHours??[]).map(h=><div key={h.dayOfWeek} className="rounded-lg bg-cloud-50 p-2 dark:bg-graphite-800"><p className="font-semibold">{h.day.slice(0,3)}</p><p className="mt-1 text-graphite-500">{h.isOpen ? `${h.openTime}–${h.closeTime}` : "Closed"}</p></div>)}</div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
              ["Products", formatCount(vendor.productCount), "Available on the storefront"],
              ["Customer reviews", vendor.reviewHealth?.recentReviews?.toLocaleString() ?? "0", "Reviews in the last 90 days"],
              ["Store since", String(new Date(vendor.createdAt).getFullYear()), "Part of TTFL Store"],
              ["Profile views", formatCount(vendor.viewCount), "Public storefront visits"],
            ].map(([label, value, hint]) => <div key={label} className={"rounded-2xl border p-4 " + (dark ? "border-white/10 bg-white/5" : "border-graphite-200 bg-cloud-50")}><p className={"text-xs font-medium " + muted}>{label}</p><p className="mt-1 text-xl font-bold">{value}</p><p className={"mt-1 text-xs " + muted}>{hint}</p></div>)}</div>
          </div>
        </section>

        {vendor.bookingSettings?.enabled && (vendor.bookingSettings.bookingUrl || vendor.bookingSettings.whatsappNumber || vendor.bookingSettings.phoneNumber || vendor.bookingSettings.email) && <section className={"mt-6 rounded-card border p-5 sm:p-6 " + panel}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><CalendarDays className="h-5 w-5" style={{ color: accent }} /><h2 className="font-bold">Book with {vendor.storeName}</h2></div><p className={"mt-1 text-sm " + muted}>{vendor.bookingSettings.instructions || "Choose a convenient way to book an appointment or consultation."}</p></div><div className="flex flex-wrap gap-2">{vendor.bookingSettings.bookingUrl && <a href={vendor.bookingSettings.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl bg-ember-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-ember-700">{vendor.bookingSettings.bookingLabel || "Book an appointment"}</a>}{vendor.bookingSettings.whatsappNumber && <a href={"https://wa.me/" + vendor.bookingSettings.whatsappNumber.replace(/\D/g, "")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-graphite-200 px-4 py-2.5 text-sm font-semibold"><WhatsAppLogo className="h-[18px] w-[18px] text-[#25D366]" />WhatsApp</a>}{vendor.bookingSettings.phoneNumber && <a href={"tel:" + vendor.bookingSettings.phoneNumber} className="inline-flex items-center justify-center rounded-xl border border-graphite-200 px-4 py-2.5 text-sm font-semibold">Call</a>}{vendor.bookingSettings.email && <a href={"mailto:" + vendor.bookingSettings.email} className="inline-flex items-center justify-center rounded-xl border border-graphite-200 px-4 py-2.5 text-sm font-semibold">Email</a>}</div></div></section>}

        {vendor.reviewHealth?.caution && <section className={"mt-6 rounded-2xl border border-gold-300 bg-gold-50 p-5 dark:border-gold-500/30 dark:bg-gold-950/20"}><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600"/><div><h2 className="font-bold text-graphite-900 dark:text-white">Order with caution</h2><p className="mt-1 text-sm leading-6 text-graphite-700 dark:text-graphite-300">According to recent customer orders and verified reviews, this store has received {vendor.reviewHealth.badReviews} bad-review signals in the last {vendor.reviewHealth.windowDays} days This does not automatically mean the store is fraudulent or that your order will have a problem, but we recommend reviewing the customer feedback and ordering with caution.</p><Link href={"/stores/" + encodeURIComponent(vendor.storeSlug) + "/reviews"} className="mt-3 inline-flex text-sm font-bold text-gold-700 hover:underline">Review recent customer feedback →</Link></div></div></section>}

        <div className={"mt-6 grid gap-6 " + (vendor.layout === "EDITORIAL" ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]" : "lg:grid-cols-[minmax(0,1fr)_300px]")}>
          <div className="min-w-0">
            {(vendor.description || vendor.bio || vendor.headline) && <section className={"rounded-card border p-5 sm:p-6 " + panel + (sectionEnabled("ABOUT") ? "" : " hidden")}><div className="flex items-center gap-2"><Sparkles className="h-4 w-4" style={{ color: accent }} /><h2 className="font-bold">About this store</h2></div><p className={"mt-3 text-sm leading-7 " + muted}>{vendor.description ?? vendor.bio ?? vendor.headline}</p><div className={"mt-5 flex flex-wrap gap-2 text-xs " + muted}>{vendor.location && <span className="inline-flex items-center gap-1.5 rounded-full border border-graphite-200 px-3 py-1.5"><MapPin className="h-3.5 w-3.5" />{vendor.location}</span>}<span className="inline-flex items-center gap-1.5 rounded-full border border-graphite-200 px-3 py-1.5"><CalendarDays className="h-3.5 w-3.5" />Since {new Date(vendor.createdAt).getFullYear()}</span></div></section>}

            {enterprise && vendor.gallery.length > 0 && <section className={"mt-6 rounded-card border p-5 sm:p-6 " + panel}><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em]" style={{ color: accent }}>Store gallery</p><h2 className="mt-1 text-xl font-bold">A closer look at {vendor.storeName}</h2></div><span className={"hidden text-xs sm:block " + muted}>{vendor.gallery.length} photos</span></div><div className={"mt-4 grid gap-2.5 " + (vendor.layout === "EDITORIAL" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4")}>{vendor.gallery.map((image, index) => <div key={image.id} className={"relative overflow-hidden rounded-2xl bg-cloud-100 " + (index === 0 && vendor.layout === "EDITORIAL" ? "aspect-[16/10] md:col-span-2" : "aspect-[4/3]")}><Image src={image.url} alt={vendor.storeName + " gallery photo " + (index + 1)} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-300 hover:scale-[1.03]" /></div>)}</div></section>}

            <section className={"mt-6 " + (sectionEnabled("PRODUCTS") || sectionEnabled("FEATURED") || sectionEnabled("BEST_SELLERS") ? "" : "hidden")}><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2"><StoreIcon className="h-5 w-5" style={{ color: accent }} /><h2 className="text-xl font-bold">{vendor.layout === "CATALOG" ? "Store catalogue" : "Shop this store"}</h2></div><p className={"mt-1 text-sm " + muted}>{items.length ? items.length + " products currently visible" : "This store has not listed any products yet."}</p></div><Link href={"/stores/" + encodeURIComponent(vendor.storeSlug) + "/reviews"} className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: accent }}>Reviews <ChevronRight className="h-4 w-4" /></Link></div>
              {items.length === 0 ? <div className={"mt-4 rounded-card border border-dashed p-10 text-center " + (dark ? "border-white/10" : "border-graphite-200")}><StoreIcon className="mx-auto h-8 w-8 opacity-30" /><p className="mt-3 font-semibold">Nothing listed yet</p><p className={"mt-1 text-sm " + muted}>Check back later for products from this store.</p></div> : <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3" style={{gridTemplateColumns:`repeat(${Math.min(5,Math.max(2,Number(vendor.storefront?.layout?.desktopColumns ?? (vendor.layout === "CATALOG" ? 5 : 4))) )},minmax(0,1fr))`}}>{items.map((p) => <ProductCard key={p.id} product={{ id: p.id, slug: p.slug, name: p.name, price: Number(p.price), previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined, image: p.images[0]?.url ?? "", vendor: p.vendor.storeName, vendorSlug: p.vendor.storeSlug, verified: p.vendor.verified, location: p.location ?? "", rating: Number(p.avgRating ?? 0), reviewCount: p.reviewCount ?? 0, sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout" }} />)}</div>}
            </section>
          </div>
          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
            <section className={"rounded-card border p-5 " + panel}><p className="text-xs font-semibold uppercase tracking-[.16em]" style={{ color: accent }}>Store at a glance</p><div className="mt-4 space-y-3"><div className="flex items-center justify-between gap-4 text-sm"><span className={muted}>Visibility</span><span className="inline-flex items-center gap-1.5 font-semibold"><span className="h-2 w-2 rounded-full bg-verified-500" />Public</span></div><div className="flex items-center justify-between gap-4 text-sm"><span className={muted}>Ordering</span><span className="text-right font-semibold">{items.some((item) => item.sellingMethod === "CHECKOUT") ? "TTFL checkout" : items.some((item) => item.sellingMethod === "WHATSAPP") ? "WhatsApp" : "Product links"}</span></div><div className="flex items-center justify-between gap-4 text-sm"><span className={muted}>Location</span><span className="max-w-[170px] truncate text-right font-semibold">{vendor.location || "Nigeria"}</span></div></div><div className="mt-5 flex flex-col gap-2">{vendor.whatsappNumber && <a href={"https://wa.me/" + vendor.whatsappNumber.replace(/\D/g, "")} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-card bg-verified-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-verified-700"><WhatsAppLogo className="h-5 w-5" />Chat on WhatsApp</a>}<Link href={"/stores/" + encodeURIComponent(vendor.storeSlug) + "/reviews"} className="inline-flex items-center justify-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold"><Star className="h-4 w-4" />Read customer reviews</Link><Link href={"/support/report-store?vendorId=" + encodeURIComponent(vendor.id) + "&store=" + encodeURIComponent(publicSlug)} className="inline-flex items-center justify-center gap-2 rounded-card border border-ember-200 px-4 py-2.5 text-sm font-semibold text-ember-700"><ShieldAlert className="h-4 w-4" />Report this store</Link></div></section>
            <section className={"rounded-card border p-5 " + panel}><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: accent + "18", color: accent }}><ShieldCheck className="h-5 w-5" /></div><div><h3 className="font-semibold">Shop with confidence</h3><p className={"mt-1 text-xs leading-5 " + muted}>{vendor.verified ? "This store has a verified vendor profile on TTFL Store." : "Use the store details, product information, and customer reviews to make an informed purchase."}</p></div></div></section>
            {vendor.viewCount > 0 && <div className={"flex items-center gap-2 px-1 text-xs " + muted}><Eye className="h-3.5 w-3.5" />{formatCount(vendor.viewCount)} public profile views</div>}
          </aside>
        </div>
      </div>
    </main>
  );
}
