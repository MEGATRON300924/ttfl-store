"use client";

import { useState } from "react";
import type { ApiProduct, ApiProductVariation } from "@/lib/api-types";
import { ProductVariationSelector } from "@/components/product-variation-selector";
import { ProductPurchaseActions } from "@/components/product-purchase-actions";
import { useProductVariation } from "@/components/product-variation-context";

export function ProductPurchaseSection({ product, variations }: { product: ApiProduct; variations: ApiProductVariation[] }) {
  const variationContext = useProductVariation();
  const [localSelectedVariant, setLocalSelectedVariant] = useState<ApiProductVariation | null>(null);
  const selectedVariant = variationContext?.selectedVariant ?? localSelectedVariant;
  const setSelectedVariant = variationContext?.setSelectedVariant ?? setLocalSelectedVariant;
  return <div className="flex flex-col gap-4">
    {variations.length > 0 && <ProductVariationSelector variations={variations} basePrice={Number(product.price)} onChange={setSelectedVariant} />}
    <ProductPurchaseActions product={product} selectedVariant={selectedVariant} />
  </div>;
}
