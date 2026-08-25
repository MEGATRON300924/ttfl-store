import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";

type PublicVendor = {
  id: string;
  storeName: string;
  storeSlug: string;
  bio: string | null;
  location: string | null;
  verified: boolean;
  _count: { products: number };
};

async function getVendor(slug: string): Promise<PublicVendor | null> {
  try {
    const { vendorProfile } = await api.get<{ vendorProfile: PublicVendor }>(`/api/vendors/store/${slug}`);
    return vendorProfile;
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
    title: vendor.storeName,
    description: vendor.bio ?? `Shop ${vendor.storeName} on TTFL Store.`,
    alternates: { canonical: `/store/${vendor.storeSlug}` },
  };
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  const vendor = await getVendor(params.slug);
  if (!vendor) notFound();

  const { items } = await getStoreProducts(params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: vendor.storeName,
    url: `https://store.thetronforge.com/store/${vendor.storeSlug}`,
  };

  return (
    <div className="shell py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex items-center gap-4 rounded-card border border-graphite-200 p-5">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-graphite-900 text-2xl font-bold text-white">
          {vendor.storeName.charAt(0)}
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold text-graphite-900">{vendor.storeName}</h1>
            {vendor.verified && <BadgeCheck className="h-5 w-5 text-verified-600" />}
          </div>
          {vendor.location && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-graphite-600">
              <MapPin className="h-3.5 w-3.5" /> {vendor.location}
            </p>
          )}
          <p className="mt-1 text-xs text-graphite-400">{vendor._count.products} products</p>
          {vendor.bio && <p className="mt-2 max-w-xl text-sm text-graphite-700">{vendor.bio}</p>}
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-lg font-bold text-graphite-900">All products</h2>
      {items.length === 0 ? (
        <div className="rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">
          This store hasn't listed any products yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: Number(p.price),
                previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined,
                image: p.images[0]?.url ?? "",
                vendor: p.vendor.storeName,
                vendorSlug: p.vendor.storeSlug,
                verified: p.vendor.verified,
                location: p.location ?? "",
                rating: 0,
                reviewCount: 0,
                sellingMethod:
                  p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
