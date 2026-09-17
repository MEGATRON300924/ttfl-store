"use client";

import { useState } from "react";
import type { ApiProduct, ApiProductVariation } from "@/lib/api-types";
import { ProductVariationSelector } from "@/components/product-variation-selector";
import { ProductPurchaseActions } from "@/components/product-purchase-actions";

export function ProductPurchaseSection({ product, variations }: { product: ApiProduct; variations: ApiProductVariation[] }) {
  const [selectedVariant, setSelectedVariant] = useState<ApiProductVariation | null>(null);
  return <div className="flex flex-col gap-4">
    {variations.length > 0 && <ProductVariationSelector variations={variations} basePrice={Number(product.price)} onChange={setSelectedVariant} />}
    <ProductPurchaseActions product={product} selectedVariant={selectedVariant} />
  </div>;
}
