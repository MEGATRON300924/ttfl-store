"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/mock-data";
import { CouponBox } from "@/components/coupon-box";

export default function CartPage() {
  const cart = useCart();

  if (cart.lines.length === 0) {
    return (
      <div className="shell py-16 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-graphite-300" />
        <h1 className="mt-4 text-lg font-bold text-graphite-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-graphite-600">Find something you'll love from a verified vendor.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  // Group lines by vendor — mirrors how checkout will actually split them
  // into per-vendor sub-orders (spec §22), so the cart doesn't surprise
  // anyone at checkout.
  const byVendor = new Map<string, { vendorName: string; lines: typeof cart.lines }>();
  for (const line of cart.lines) {
    const group = byVendor.get(line.vendorId) ?? { vendorName: line.vendorName, lines: [] };
    group.lines.push(line);
    byVendor.set(line.vendorId, group);
  }

  return (
    <div className="shell py-8">
      <h1 className="text-xl font-bold text-graphite-900">Your cart</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {[...byVendor.entries()].map(([vendorId, group]) => (
            <div key={vendorId} className="rounded-card border border-graphite-200">
              <div className="border-b border-graphite-200 px-4 py-3">
                <p className="text-sm font-semibold text-graphite-900">{group.vendorName}</p>
              </div>
              <div className="divide-y divide-graphite-200">
                {group.lines.map((line) => (
                  <div key={line.productId} className="flex gap-3 p-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[6px] bg-cloud-100">
                      {line.image && (
                        <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${line.slug}`}
                          className="text-sm font-medium text-graphite-900 hover:text-ember-600"
                        >
                          {line.name}
                        </Link>
                        <button
                          onClick={() => cart.remove(line.productId)}
                          className="shrink-0 text-graphite-400 hover:text-ember-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-card border border-graphite-200">
                          <button
                            onClick={() => cart.updateQuantity(line.productId, line.quantity - 1)}
                            className="grid h-8 w-8 place-items-center text-graphite-700 hover:bg-cloud-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono text-sm">{line.quantity}</span>
                          <button
                            onClick={() => cart.updateQuantity(line.productId, line.quantity + 1)}
                            className="grid h-8 w-8 place-items-center text-graphite-700 hover:bg-cloud-100"
                            aria-label="Increase quantity"
                            disabled={line.quantity >= line.maxStock}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-mono text-sm font-semibold text-graphite-900">
                          {formatNaira(line.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-card border border-graphite-200 p-5">
          <h2 className="text-sm font-bold text-graphite-900">Order summary</h2>
          <div className="mt-3 flex justify-between text-sm text-graphite-700">
            <span>Subtotal ({cart.totalItems} items)</span>
            <span className="font-mono">{formatNaira(cart.totalAmount)}</span>
          </div>
          {cart.appliedCoupon && (
            <div className="mt-1.5 flex justify-between text-sm text-verified-700">
              <span>Discount ({cart.appliedCoupon.code})</span>
              <span className="font-mono">−{formatNaira(cart.appliedCoupon.discountAmount)}</span>
            </div>
          )}
          <div className="mt-1.5 flex justify-between border-t border-graphite-200 pt-1.5 text-sm font-semibold text-graphite-900">
            <span>Estimated total</span>
            <span className="font-mono">
              {formatNaira(Math.max(0, cart.totalAmount - (cart.appliedCoupon?.discountAmount ?? 0)))}
            </span>
          </div>
          <p className="mt-1 text-xs text-graphite-400">Delivery fees calculated at checkout.</p>

          <CouponBox
            lines={cart.lines}
            applied={cart.appliedCoupon}
            onApply={cart.applyCoupon}
            onRemove={cart.removeCoupon}
          />

          <Link
            href="/checkout"
            className="mt-4 block w-full rounded-card bg-ember-600 py-3 text-center text-sm font-semibold text-white hover:bg-ember-700"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
