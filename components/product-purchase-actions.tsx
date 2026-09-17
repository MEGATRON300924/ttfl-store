"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, MessageCircle, ExternalLink, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { api } from "@/lib/api-client";
import type { ApiProduct, ApiProductVariation } from "@/lib/api-types";

export function ProductPurchaseActions({ product, selectedVariant = null }: { product: ApiProduct; selectedVariant?: ApiProductVariation | null }) {
  const [quantity, setQuantity] = useState(1);
  const [redirecting, setRedirecting] = useState(false);
  const cart = useCart();
  const router = useRouter();
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const variantPrice = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price);
  const outOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";

  function addLineToCart(andCheckout: boolean) {
    cart.add({ productId: product.id, variantKey: selectedVariant?.key, variantLabel: selectedVariant?.label, name: selectedVariant ? `${product.name} — ${selectedVariant.label}` : product.name, slug: product.slug, price: variantPrice, image: primaryImage?.url ?? "", vendorId: product.vendor.id, categoryId: product.category.id, vendorName: product.vendor.storeName, maxStock: product.stock }, quantity);
    if (andCheckout) router.push("/cart");
  }

  async function handleReferralClick() {
    setRedirecting(true);
    try { const { destination } = await api.post<{ destination: string }>(`/api/products/by-id/${product.id}/referral`, { source: "product_page" }); window.open(destination, "_blank", "noopener,noreferrer"); } catch (err) { console.error(err); } finally { setRedirecting(false); }
  }

  if (product.sellingMethod === "EXTERNAL_LINK") return <button onClick={handleReferralClick} disabled={redirecting} className="flex w-full items-center justify-center gap-2 rounded-card bg-graphite-900 px-5 py-3.5 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"><ExternalLink className="h-4 w-4" />{redirecting ? "Opening…" : "Buy on seller's website"}</button>;
  if (product.sellingMethod === "WHATSAPP") return <button onClick={handleReferralClick} disabled={redirecting} className="flex w-full items-center justify-center gap-2 rounded-card bg-verified-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-verified-700 disabled:opacity-60"><MessageCircle className="h-4 w-4" />{redirecting ? "Opening…" : "Contact seller on WhatsApp"}</button>;

  return <div className="flex flex-col gap-3">
    <div className="flex items-center gap-3"><span className="text-sm font-medium text-graphite-700">Quantity</span><div className="flex items-center rounded-card border border-graphite-200"><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center text-graphite-700 hover:bg-cloud-100" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button><span className="w-10 text-center font-mono text-sm">{quantity}</span><button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="grid h-9 w-9 place-items-center text-graphite-700 hover:bg-cloud-100" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button></div><span className="text-xs text-graphite-400">{product.stock} in stock</span></div>
    <div className="flex flex-col gap-2 sm:flex-row"><button onClick={() => addLineToCart(false)} disabled={outOfStock} className="flex flex-1 items-center justify-center gap-2 rounded-card border border-graphite-300 px-5 py-3.5 text-sm font-semibold text-graphite-900 hover:bg-cloud-100 disabled:opacity-50"><ShoppingCart className="h-4 w-4" />Add to cart</button><button onClick={() => addLineToCart(true)} disabled={outOfStock} className="flex-1 rounded-card bg-ember-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:opacity-50">{outOfStock ? "Out of stock" : "Buy now"}</button></div>
  </div>;
}
