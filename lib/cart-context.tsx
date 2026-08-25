"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartLine = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  vendorId: string;
  vendorName: string;
  categoryId: string;
  quantity: number;
  maxStock: number;
};

export type AppliedCoupon = { code: string; discountAmount: number };

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  totalItems: number;
  totalAmount: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "ttfl_store_cart_v1";
const COUPON_STORAGE_KEY = "ttfl_store_coupon_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // This is a real deployed Next.js app (not a Claude artifact), so
  // localStorage is the right call here for a guest-friendly cart.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
      const rawCoupon = window.localStorage.getItem(COUPON_STORAGE_KEY);
      if (rawCoupon) setAppliedCoupon(JSON.parse(rawCoupon));
    } catch {
      // corrupted cart data — start fresh rather than crash the app
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (appliedCoupon) window.localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    else window.localStorage.removeItem(COUPON_STORAGE_KEY);
  }, [appliedCoupon, hydrated]);

  function add(line: Omit<CartLine, "quantity">, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === line.productId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, existing.maxStock);
        return prev.map((l) => (l.productId === line.productId ? { ...l, quantity: nextQty } : l));
      }
      return [...prev, { ...line, quantity: Math.min(quantity, line.maxStock) }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(quantity, l.maxStock) } : l))
    );
  }

  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function clear() {
    setLines([]);
    setAppliedCoupon(null);
  }

  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);
  const totalAmount = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

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
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
