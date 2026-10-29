import type { Metadata } from "next";
import Link from "next/link";
import { Flame, ArrowRight, CalendarClock, Tag } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { BlackFridayCountdown } from "@/components/black-friday-countdown";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";

type Campaign = { enabled: boolean; startsAt: string; endsAt: string; headline: string; subheadline: string; discountMode: "vendor" | "admin" | "vendor-approval"; participation: "both" | "vendors" | "ttfl" };
type FlashDeal = { id: string; productId: string; name: string; slug: string; price: number | string; salePrice: number | string; storeName: string; storeSlug: string; verified: boolean; imageUrl?: string | null; startsAt?: string; endsAt?: string; discountPercent?: number | string; blackFriday?: boolean };

const SITE_URL = "https://ttflstore.name.ng";

async function getCampaign() {
  try {
    return await api.get<{ campaign: Campaign; isLive: boolean; isScheduled: boolean }>("/api/settings/black-friday/public");
  } catch {
    return { campaign: { enabled: false, startsAt: "2026-11-26T23:00:00.000Z", endsAt: "2026-11-27T23:00:00.000Z", headline: "Black Friday at TTFL Store", subheadline: "Discover limited-time deals from Nigerian sellers.", discountMode: "vendor-approval" as const, participation: "both" as const }, isLive: false, isScheduled: false };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { campaign, isLive } = await getCampaign();
  const title = isLive ? campaign.headline : "TTFL Store Black Friday 2026 Is Around the Corner";
  const description = isLive
    ? campaign.subheadline
    : "TTFL Store Black Friday Week is almost here! Count down to November 23–30, 2026 and get ready to discover limited-time shopping deals across Nigeria.";
  const keywords = [
    "TTFL Store Black Friday", "Black Friday Nigeria 2026", "Black Friday deals Nigeria",
    "TTFL Store Black Friday Week", "Black Friday countdown", "online shopping deals Nigeria",
    "Cyber Monday Nigeria", "TTFL Store deals",
  ];
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `${SITE_URL}/black-friday` },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: { type: "website", siteName: "TTFL Store", title, description, url: `${SITE_URL}/black-friday`, locale: "en_NG", images: [{ url: "/ttflstore.png", width: 1200, height: 630, alt: "TTFL Store Black Friday Week 2026 countdown" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/ttflstore.png"] },
  };
}

function toProduct(deal: FlashDeal): Product {
  return {
    id: deal.productId,
    slug: deal.slug,
    name: deal.name,
    price: Number(deal.salePrice),
    previousPrice: Number(deal.price),
    image: deal.imageUrl ?? "",
    vendor: deal.storeName,
    vendorSlug: deal.storeSlug,
    verified: Boolean(deal.verified),
    location: "",
    rating: 0,
    reviewCount: 0,
    sellingMethod: "checkout",
  };
}

function toRegularProduct(product: ApiProduct): Product {
  const image = product.images?.find((item) => !item.url.includes("/video/upload/")) ?? product.images?.[0];
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    previousPrice: product.previousPrice ? Number(product.previousPrice) : undefined,
    image: image?.url ?? "",
    video: product.images?.find((item) => item.url.includes("/video/upload/"))?.url ?? null,
    vendor: product.vendor.storeName,
    vendorSlug: product.vendor.storeSlug,
    verified: Boolean(product.vendor.verified),
    location: product.location ?? product.vendor.location ?? "",
    rating: Number(product.avgRating ?? 0),
    reviewCount: product.reviewCount ?? 0,
    sellingMethod: product.sellingMethod === "EXTERNAL_LINK" ? "external" : product.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout",
    whatsappNumber: product.whatsappNumber ?? product.vendor.whatsappNumber ?? null,
    externalUrl: product.externalUrl ?? null,
    comingSoon: Boolean(product.comingSoon),
  };
}

export default async function BlackFridayPage() {
  const { campaign, isLive, isScheduled } = await getCampaign();
  const [dealsResult, productsResult] = await Promise.allSettled([
    api.get<{ deals: FlashDeal[] }>("/api/flash-deals"),
    api.get<{ items: ApiProduct[] }>("/api/products?sort=relevance&limit=24"),
  ]);
  const deals = dealsResult.status === "fulfilled" ? (dealsResult.value.deals ?? []).filter((deal) => deal.blackFriday) : [];
  const products = productsResult.status === "fulfilled" ? productsResult.value.items ?? [] : [];
  const campaignProducts = deals.map(toProduct);
  const featuredProducts = products.filter((product) => !product.comingSoon && product.status === "ACTIVE").map(toRegularProduct);
  const visibleProducts = isLive ? campaignProducts : [];
  const dateLabel = new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeZone: "Africa/Lagos" }).format(new Date(campaign.startsAt));

  return (
    <div className="min-h-[70vh] bg-cloud-50 dark:bg-graphite-950">
      <section className="relative overflow-hidden bg-graphite-950 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 80% 15%, rgba(249,115,22,.55), transparent 35%), radial-gradient(circle at 10% 100%, rgba(220,38,38,.35), transparent 35%)" }} />
        <div className="shell relative py-12 sm:py-16 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-ember-500/40 bg-ember-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ember-300"><Flame className="h-4 w-4" /> TTFL Store Special</span>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">{isLive ? campaign.headline : "TTFL Store Black Friday Is Around the Corner"}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-graphite-300 sm:text-base">{isLive ? campaign.subheadline : "Black Friday Week is coming to TTFL Store from November 23–30, 2026. Get ready to explore limited-time offers from the marketplace, compare products, and find great deals—all online."}</p>
          <BlackFridayCountdown />
          {isLive ? <div className="mt-7 inline-flex items-center gap-2 rounded-card bg-ember-600 px-4 py-3 text-sm font-bold"><Tag className="h-4 w-4" /> Black Friday deals are live</div> : isScheduled ? <div className="mt-7 inline-flex items-center gap-2 rounded-card border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white"><CalendarClock className="h-4 w-4 text-ember-400" /> Starts {dateLabel}</div> : <div className="mt-7 inline-flex items-center gap-2 rounded-card border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white"><CalendarClock className="h-4 w-4 text-ember-400" /> Campaign not active yet</div>}
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/shop" className="inline-flex items-center gap-2 rounded-card bg-white px-4 py-3 text-sm font-bold text-graphite-950 hover:bg-cloud-100">Explore the marketplace <ArrowRight className="h-4 w-4" /></Link><Link href="/deals" className="inline-flex items-center gap-2 rounded-card border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">View all deals</Link></div>
        </div>
      </section>

      <section className="shell py-9 sm:py-12">
        {isLive && visibleProducts.length > 0 ? <>
          <div className="mb-5 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-ember-700">Limited-time offers</p><h2 className="mt-1 text-xl font-bold text-graphite-950 dark:text-white sm:text-2xl">Black Friday deals</h2><p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Prices and availability can change while the campaign is live.</p></div><span className="rounded-full bg-ember-100 px-3 py-1 text-xs font-bold text-ember-800">{visibleProducts.length} deals</span></div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </> : <div className="rounded-card border border-graphite-200 bg-white p-6 dark:border-graphite-800 dark:bg-graphite-900 sm:p-8"><h2 className="text-lg font-bold text-graphite-950 dark:text-white">{isLive ? "Featured deals are being prepared" : isScheduled ? "Get ready for Black Friday" : "Black Friday deals are not live yet"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600 dark:text-graphite-400">{isLive ? "The campaign is active, but there are no eligible flash deals to display right now. Check the current flash deals or return soon." : isScheduled ? `The campaign is scheduled to start on ${dateLabel}. Check back during the event for eligible deals.` : "Explore the regular marketplace and current flash deals while you wait. Only active, time-valid offers are shown as discounted prices."}</p><div className="mt-5 grid grid-cols-2 gap-2 sm:flex"><Link href="/deals" className="inline-flex items-center justify-center gap-2 rounded-card bg-graphite-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-graphite-950">Current flash deals <ArrowRight className="h-4 w-4" /></Link><Link href="/shop" className="inline-flex items-center justify-center rounded-card border border-graphite-200 px-4 py-3 text-sm font-semibold text-graphite-800 dark:border-graphite-700 dark:text-white">Shop all products</Link></div></div>}
        {isLive && campaign.participation !== "ttfl" && featuredProducts.length > 0 && <div className="mt-10"><div className="mb-4"><h2 className="text-xl font-bold text-graphite-950 dark:text-white">More from the marketplace</h2><p className="mt-1 text-sm text-graphite-600 dark:text-graphite-400">Browse available listings from participating sellers.</p></div><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{featuredProducts.slice(0, 10).map((product) => <ProductCard key={product.id} product={product} />)}</div></div>}
      </section>
    </div>
  );
}
