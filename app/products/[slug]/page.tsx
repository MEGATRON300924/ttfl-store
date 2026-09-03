import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin, MessageCircle, Star } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiProduct, StoreBadge } from "@/lib/api-types";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchaseActions } from "@/components/product-purchase-actions";
import { ReviewsSection } from "@/components/reviews-section";
import { WishlistButton } from "@/components/wishlist-button";
import { StoreBadges } from "@/components/store-badges";

const SITE_URL = "https://ttflstore.name.ng";
const DEFAULT_SEO_IMAGE = "/ttflstore.png";

async function getProduct(slug: string): Promise<ApiProduct | null> {
  try {
    const { product } = await api.get<{ product: ApiProduct }>(`/api/products/${slug}`);
    return product;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function getStoreProfile(slug: string) {
  try {
    const { store } = await api.get<{
      store: {
        storeName: string;
        storeSlug: string;
        logoUrl: string | null;
        verified: boolean;
        tier: string | null;
        badges: StoreBadge[];
      };
    }>(`/api/store-profile/public/${encodeURIComponent(slug)}`);
    return store;
  } catch {
    return null;
  }
}

function cleanDescription(value: string, fallback: string) {
  const text = value.replace(/\s+/g, " ").trim();
  return (text || fallback).slice(0, 155);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return {
      title: "Product not found",
      description: "This product could not be found on TTFL Store.",
      openGraph: { title: "Product not found | TTFL Store", description: "This product could not be found on TTFL Store.", images: [{ url: DEFAULT_SEO_IMAGE, width: 1200, height: 630, alt: "TTFL Store" }] },
      twitter: { card: "summary_large_image", images: [DEFAULT_SEO_IMAGE] },
    };
  }

  const description = cleanDescription(product.description, `Shop ${product.name} on TTFL Store.`);
  const image = product.images[0]?.url || DEFAULT_SEO_IMAGE;
  const canonical = `${SITE_URL}/products/${product.slug}`;

  return {
    title: `${product.name} | TTFL Store`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "TTFL Store",
      title: product.name,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const store = await getStoreProfile(product.vendor.storeSlug);
  const storeBadges: StoreBadge[] = store?.badges?.length ? store.badges : product.vendor.verified ? ["VERIFIED"] : [];
  const storeLogo = store?.logoUrl?.trim() || null;
  const storeName = store?.storeName || product.vendor.storeName;
  const storeSlug = store?.storeSlug || product.vendor.storeSlug;
  const discount = product.previousPrice && Number(product.previousPrice) > Number(product.price) ? Math.round(100 - (Number(product.price) / Number(product.previousPrice)) * 100) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    sku: product.id,
    brand: { "@type": "Brand", name: product.vendor.storeName },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="shell py-6">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-graphite-600">
          <Link href="/" className="hover:text-ember-600">Home</Link><span>/</span>
          <Link href={`/categories/${product.category.slug}`} className="hover:text-ember-600">{product.category.name}</Link><span>/</span>
          <span className="truncate text-graphite-900">{product.name}</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative"><ProductGallery images={product.images} productName={product.name} /><div className="absolute right-3 top-3"><WishlistButton productId={product.id} /></div></div>
          <div>
            {discount && <span className="forge-tag mb-2 inline-block bg-ember-600 py-1 pl-2.5 pr-4 font-mono text-xs font-medium text-white">-{discount}% OFF</span>}
            <h1 className="text-2xl font-bold tracking-tight text-graphite-900">{product.name}</h1>
            {product.reviewCount > 0 && <div className="mt-1 flex items-center gap-1 text-sm text-graphite-700"><Star className="h-3.5 w-3.5 fill-gold-600 text-gold-600" /><span className="font-medium">{Number(product.avgRating).toFixed(1)}</span><span className="text-graphite-400">({product.reviewCount})</span></div>}
            <div className="mt-2 flex items-baseline gap-3 font-mono"><span className="text-2xl font-bold text-graphite-900">{formatNaira(Number(product.price))}</span>{product.previousPrice && <span className="text-base text-graphite-400 line-through">{formatNaira(Number(product.previousPrice))}</span>}</div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-graphite-600">
              <span className="rounded-tag bg-cloud-100 px-2 py-1 font-medium">{product.condition}</span>
              {product.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {product.location}</span>}
              <span className="flex items-center gap-1">{product.sellingMethod === "EXTERNAL_LINK" && <ExternalLink className="h-3.5 w-3.5" />}{product.sellingMethod === "WHATSAPP" && <MessageCircle className="h-3.5 w-3.5" />}{product.sellingMethod === "CHECKOUT" && "TTFL Store checkout"}{product.sellingMethod === "EXTERNAL_LINK" && "Sold on seller's site"}{product.sellingMethod === "WHATSAPP" && "Sold via WhatsApp"}</span>
            </div>
            <div className="mt-6 border-t border-graphite-200 pt-6"><ProductPurchaseActions product={product} /></div>
            <Link href={`/store/${storeSlug}`} className="mt-6 block rounded-card border border-graphite-200 p-3 transition hover:border-ember-600">
              <div className="flex items-center gap-3">
                {storeLogo ? <span className="relative grid h-12 w-12 shrink-0 overflow-hidden rounded-full border border-graphite-200 bg-cloud-100"><Image src={storeLogo} alt={`${storeName} logo`} fill sizes="48px" className="object-cover" /></span> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-graphite-900 text-sm font-bold text-white">{storeName.charAt(0).toUpperCase()}</span>}
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-graphite-900">{storeName}</p><p className="mt-0.5 text-xs text-graphite-600">Visit store</p></div>
              </div>
              {storeBadges.length > 0 && <div className="mt-3 border-t border-graphite-100 pt-3"><StoreBadges badges={storeBadges} /></div>}
            </Link>
          </div>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section><h2 className="mb-3 text-lg font-bold text-graphite-900">Description</h2><p className="whitespace-pre-line text-sm leading-relaxed text-graphite-700">{product.description}</p>{product.specifications && Object.keys(product.specifications as object).length > 0 && <div className="mt-6"><h3 className="mb-2 text-sm font-bold text-graphite-900">Specifications</h3><dl className="divide-y divide-graphite-200 rounded-card border border-graphite-200">{Object.entries(product.specifications as Record<string, string>).map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-3 py-2 text-sm"><dt className="text-graphite-600">{k}</dt><dd className="text-right font-medium text-graphite-900">{v}</dd></div>)}</dl></div>}</section>
        </div>
        <ReviewsSection productId={product.id} avgRating={product.avgRating ? Number(product.avgRating) : null} reviewCount={product.reviewCount} />
      </div>
    </>
  );
}
