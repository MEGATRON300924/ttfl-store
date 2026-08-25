import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Star, ExternalLink, MessageCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/mock-data";
import type { ApiProduct } from "@/lib/api-types";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchaseActions } from "@/components/product-purchase-actions";
import { ReviewsSection } from "@/components/reviews-section";
import { WishlistButton } from "@/components/wishlist-button";
import { Section } from "@/components/section";

async function getProduct(slug: string): Promise<ApiProduct | null> {
  try {
    const { product } = await api.get<{ product: ApiProduct }>(`/api/products/${slug}`);
    return product;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product not found" };

  const image = product.images[0]?.url;
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const discount =
    product.previousPrice && Number(product.previousPrice) > Number(product.price)
      ? Math.round(100 - (Number(product.price) / Number(product.previousPrice)) * 100)
      : null;

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
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `https://store.thetronforge.com/products/${product.slug}`,
    },
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="shell py-6">
        {/* Breadcrumbs (spec §38 BreadcrumbList intent, rendered simply) */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-graphite-600">
          <Link href="/" className="hover:text-ember-600">Home</Link>
          <span>/</span>
          <Link href={`/categories/${product.category.slug}`} className="hover:text-ember-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="truncate text-graphite-900">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative">
            <ProductGallery images={product.images} productName={product.name} />
            <div className="absolute right-3 top-3">
              <WishlistButton productId={product.id} />
            </div>
          </div>

          <div>
            {discount && (
              <span className="forge-tag mb-2 inline-block bg-ember-600 py-1 pl-2.5 pr-4 font-mono text-xs font-medium text-white">
                -{discount}% OFF
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-graphite-900">{product.name}</h1>

            {product.reviewCount > 0 && (
              <div className="mt-1 flex items-center gap-1 text-sm text-graphite-700">
                <Star className="h-3.5 w-3.5 fill-gold-600 text-gold-600" />
                <span className="font-medium">{Number(product.avgRating).toFixed(1)}</span>
                <span className="text-graphite-400">({product.reviewCount})</span>
              </div>
            )}

            <div className="mt-2 flex items-baseline gap-3 font-mono">
              <span className="text-2xl font-bold text-graphite-900">{formatNaira(Number(product.price))}</span>
              {product.previousPrice && (
                <span className="text-base text-graphite-400 line-through">
                  {formatNaira(Number(product.previousPrice))}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-graphite-600">
              <span className="rounded-tag bg-cloud-100 px-2 py-1 font-medium">{product.condition}</span>
              {product.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {product.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                {product.sellingMethod === "EXTERNAL_LINK" && <ExternalLink className="h-3.5 w-3.5" />}
                {product.sellingMethod === "WHATSAPP" && <MessageCircle className="h-3.5 w-3.5" />}
                {product.sellingMethod === "CHECKOUT" && "TTFL Store checkout"}
                {product.sellingMethod === "EXTERNAL_LINK" && "Sold on seller's site"}
                {product.sellingMethod === "WHATSAPP" && "Sold via WhatsApp"}
              </span>
            </div>

            <div className="mt-6 border-t border-graphite-200 pt-6">
              <ProductPurchaseActions product={product} />
            </div>

            <Link
              href={`/store/${product.vendor.storeSlug}`}
              className="mt-6 flex items-center gap-3 rounded-card border border-graphite-200 p-3 hover:border-ember-600"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-graphite-900 text-sm font-bold text-white">
                {product.vendor.storeName.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-sm font-semibold text-graphite-900">{product.vendor.storeName}</p>
                  {product.vendor.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-verified-600" />}
                </div>
                <p className="text-xs text-graphite-600">Visit store</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section>
            <h2 className="mb-3 text-lg font-bold text-graphite-900">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-graphite-700">
              {product.description}
            </p>

            {product.specifications && Object.keys(product.specifications as object).length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-bold text-graphite-900">Specifications</h3>
                <dl className="divide-y divide-graphite-200 rounded-card border border-graphite-200">
                  {Object.entries(product.specifications as Record<string, string>).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-graphite-600">{k}</dt>
                      <dd className="text-right font-medium text-graphite-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>
        </div>

        <ReviewsSection productId={product.id} avgRating={product.avgRating ? Number(product.avgRating) : null} reviewCount={product.reviewCount} />
      </div>
    </>
  );
}
