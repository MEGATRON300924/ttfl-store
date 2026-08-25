"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { ProductCard } from "@/components/product-card";

type WishlistApiItem = {
  id: string;
  product: {
    id: string;
    slug: string;
    name: string;
    price: string;
    previousPrice: string | null;
    location: string | null;
    images: { url: string }[];
    vendor: { storeName: string; storeSlug: string; verified: boolean };
  };
};

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<WishlistApiItem[] | null>(null);

  useEffect(() => {
    if (user) {
      api.get<{ items: WishlistApiItem[] }>("/api/wishlist").then((r) => setItems(r.items));
    }
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">Log in to view your wishlist</h1>
        <Link
          href="/login?next=/wishlist"
          className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Your wishlist</h1>

      {items === null ? (
        <p className="mt-6 text-sm text-graphite-600">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-600">
          <Heart className="mx-auto mb-2 h-8 w-8 text-graphite-300" />
          Nothing saved yet — tap the heart on any product to add it here.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.product.id,
                slug: item.product.slug,
                name: item.product.name,
                price: Number(item.product.price),
                previousPrice: item.product.previousPrice ? Number(item.product.previousPrice) : undefined,
                image: item.product.images[0]?.url ?? "",
                vendor: item.product.vendor.storeName,
                vendorSlug: item.product.vendor.storeSlug,
                verified: item.product.vendor.verified,
                location: item.product.location ?? "",
                rating: 0,
                reviewCount: 0,
                sellingMethod: "checkout",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
