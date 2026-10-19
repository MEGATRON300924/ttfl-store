"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ApiProductVariation } from "@/lib/api-types";

type ProductVariationContextValue = {
  selectedVariant: ApiProductVariation | null;
  setSelectedVariant: (variant: ApiProductVariation | null) => void;
};

const ProductVariationContext = createContext<ProductVariationContextValue | null>(null);

export function ProductVariationProvider({ children }: { children: ReactNode }) {
  const [selectedVariant, setSelectedVariant] = useState<ApiProductVariation | null>(null);
  return (
    <ProductVariationContext.Provider value={{ selectedVariant, setSelectedVariant }}>
      {children}
    </ProductVariationContext.Provider>
  );
}

export function useProductVariation() {
  return useContext(ProductVariationContext);
}
