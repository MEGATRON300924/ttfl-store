"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

export type CartLine = {
  productId: string;
  variantKey?: string;
  variantLabel?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  vendorId: string;
  vendorName: string;
  categoryId: string;
  quantity: number;
  maxStock: number;
  unavailable?: boolean;
};

export type AppliedCoupon = { code: string; discountAmount: number };

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number, variantKey?: string) => void;
  remove: (productId: string, variantKey?: string) => void;
  clear: () => void;
  totalItems: number;
  totalAmount: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
};

type CartValidationResult = {
  productId: string;
  variantKey?: string;
  unavailable: boolean;
  price?: number;
  maxStock?: number;
  image?: string;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "ttfl_store_cart_v1";
const COUPON_STORAGE_KEY = "ttfl_store_coupon_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    setHydrated(false);
    setLines([]);
    setAppliedCoupon(null);

    if (!user) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(COUPON_STORAGE_KEY);
      } catch {}
      setHydrated(true);
      return;
    }

    try {
      const storageKey = `${STORAGE_KEY}_${user.id}`;
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setLines(JSON.parse(raw));

      const rawCoupon = window.localStorage.getItem(`${COUPON_STORAGE_KEY}_${user.id}`);
      if (rawCoupon) setAppliedCoupon(JSON.parse(rawCoupon));

      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {}

    setHydrated(true);
  }, [user, authLoading]);

  useEffect(() => {
    if (!hydrated || !user) return;
    window.localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(lines));
  }, [lines, hydrated, user]);

  useEffect(() => {
    if (!hydrated || !user) return;

    const key = `${COUPON_STORAGE_KEY}_${user.id}`;
    if (appliedCoupon) {
      window.localStorage.setItem(key, JSON.stringify(appliedCoupon));
    } else {
      window.localStorage.removeItem(key);
    }
  }, [appliedCoupon, hydrated, user]);

  useEffect(() => {
    if (!hydrated || !user || lines.length === 0) return;

    let cancelled = false;

    async function validateCart() {
      const results: CartValidationResult[] = await Promise.all(
        lines.map(async (line): Promise<CartValidationResult> => {
          try {
            const response = await api.get<{
              product: {
                id: string;
                price: string;
                stock: number;
                status: string;
                sellingMethod: string;
                slug: string;
                images?: Array<{ url: string; isPrimary?: boolean }>;
              };
            }>(`/api/products/${encodeURIComponent(line.slug)}`);

            const product = response.product;
            const stock = Math.max(0, Number(product.stock) || 0);

            if (product.status !== "ACTIVE" || stock <= 0) {
              return {
                productId: line.productId,
                variantKey: line.variantKey,
                unavailable: true,
              };
            }

            const primaryImage =
              product.images?.find((image) => image.isPrimary) ??
              product.images?.[0];

            return {
              productId: line.productId,
              variantKey: line.variantKey,
              unavailable: false,
              price: Number(product.price),
              maxStock: stock,
              image: primaryImage?.url ?? line.image,
            };
          } catch {
            return {
              productId: line.productId,
              variantKey: line.variantKey,
              unavailable: true,
            };
          }
        }),
      );

      if (cancelled) return;

      setLines((current) =>
        current.map((line) => {
          const result = results.find(
            (item) =>
              item.productId === line.productId &&
              (item.variantKey ?? "") === (line.variantKey ?? ""),
          );

          if (!result) return line;

          if (result.unavailable) {
            return { ...line, unavailable: true, maxStock: 0 };
          }

          return {
            ...line,
            unavailable: false,
            price: result.price ?? line.price,
            maxStock: result.maxStock ?? line.maxStock,
            image: result.image ?? line.image,
            quantity: Math.min(
              line.quantity,
              result.maxStock ?? line.maxStock,
            ),
          };
        }),
      );

      const unavailableKeys = results
        .filter((item) => item.unavailable)
        .map(
          (item) =>
            `${item.productId}:${item.variantKey ?? ""}`,
        );

      if (unavailableKeys.length) {
        window.setTimeout(() => {
          if (cancelled) return;

          setLines((current) =>
            current.filter(
              (line) =>
                !unavailableKeys.includes(
                  `${line.productId}:${line.variantKey ?? ""}`,
                ),
            ),
          );
        }, 2500);
      }
    }

    void validateCart();

    return () => {
      cancelled = true;
    };
  }, [hydrated, user?.id]);

  function sameLine(a: CartLine, b: Omit<CartLine, "quantity">) {
    return (
      a.productId === b.productId &&
      (a.variantKey ?? "") === (b.variantKey ?? "")
    );
  }

  function add(line: Omit<CartLine, "quantity">, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((item) => sameLine(item, line));

      if (existing) {
        const nextQty = Math.min(
          existing.quantity + quantity,
          existing.maxStock,
        );

        return prev.map((item) =>
          sameLine(item, line)
            ? { ...item, quantity: nextQty, unavailable: false }
            : item,
        );
      }

      return [
        ...prev,
        {
          ...line,
          unavailable: false,
          quantity: Math.min(quantity, line.maxStock),
        },
      ];
    });
  }

  function updateQuantity(
    productId: string,
    quantity: number,
    variantKey?: string,
  ) {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter(
            (line) =>
              !(
                line.productId === productId &&
                (line.variantKey ?? "") === (variantKey ?? "")
              ),
          )
        : prev.map((line) =>
            line.productId === productId &&
            (line.variantKey ?? "") === (variantKey ?? "")
              ? { ...line, quantity: Math.min(quantity, line.maxStock) }
              : line,
          ),
    );
  }

  function remove(productId: string, variantKey?: string) {
    setLines((prev) =>
      prev.filter(
        (line) =>
          !(
            line.productId === productId &&
            (line.variantKey ?? "") === (variantKey ?? "")
          ),
      ),
    );
  }

  function clear() {
    setLines([]);
    setAppliedCoupon(null);
  }

  const purchasableLines = lines.filter(
    (line) => !line.unavailable && line.maxStock > 0,
  );

  const totalItems = purchasableLines.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );

  const totalAmount = purchasableLines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        add,
        updateQuantity,
        remove,
        clear,
        totalItems,
        totalAmount,
        appliedCoupon,
        applyCoupon: setAppliedCoupon,
        removeCoupon: () => setAppliedCoupon(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
}
