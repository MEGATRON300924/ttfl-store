"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { ProductForm, type ProductFormValues } from "@/components/product-form";
import type { ApiProduct } from "@/lib/api-types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<ProductFormValues> | null>(null);

  useEffect(() => {
    api.get<{ products: ApiProduct[] }>("/api/products/me/list").then(({ products }) => {
      const product = products.find((p) => p.id === params.id);
      if (!product) return;
      setInitial({
        name: product.name,
        description: product.description,
        categorySlug: product.category.slug,
        price: String(product.price),
        previousPrice: product.previousPrice ? String(product.previousPrice) : "",
        condition: product.condition,
        stock: String(product.stock),
        location: product.location ?? "",
        images: product.images.map((i) => ({ url: i.url, publicId: `existing-${i.id}` })),
        sellingMethod: product.sellingMethod,
        externalUrl: product.externalUrl ?? "",
        whatsappNumber: product.whatsappNumber ?? "",
      });
    });
  }, [params.id]);

  return (
    <div className="shell max-w-2xl py-8">
      <h1 className="text-xl font-bold text-graphite-900">Edit product</h1>
      <div className="mt-6">
        {initial ? (
          <ProductForm productId={params.id} initial={initial} />
        ) : (
          <p className="text-sm text-graphite-600">Loading…</p>
        )}
      </div>
    </div>
  );
}
