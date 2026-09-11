"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, BadgeCheck, MessageCircle, ExternalLink, Bell, Sparkles, Users, ShoppingCart, Loader2 } from "lucide-react";
import { formatNaira, type Product } from "@/lib/mock-data";
import { WishlistButton } from "@/components/wishlist-button";
import { DeliveryEstimate } from "@/components/delivery-estimate";
import { ProductVideoPlayer } from "@/components/product-video-player";
import { api } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";
import type { ApiProduct } from "@/lib/api-types";
import { useRouter } from "next/navigation";

export function ProductCard({ product }: { product: Product }) {
  if (product.comingSoon) return <ComingSoonCard product={product} />;
  return <StandardProductCard product={product} />;
}

function StandardProductCard({ product }: { product: Product }) {
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null);
  const [error, setError] = useState(false);
  const cart = useCart();
  const router = useRouter();
  const discount = product.previousPrice && product.previousPrice > product.price ? Math.round(100 - (product.price / product.previousPrice) * 100) : null;

  async function purchase(andCheckout: boolean) {
    if (product.sellingMethod !== "checkout") return;
    setBusy(andCheckout ? "buy" : "cart");
    setError(false);
    try {
      const response = await api.get<{ product: ApiProduct }>(`/api/products/${encodeURIComponent(product.slug)}`);
      const item = response.product;
      const primaryImage = item.images.find((image) => image.isPrimary && !image.url.includes("/video/upload/")) ?? item.images.find((image) => !image.url.includes("/video/upload/")) ?? item.images[0];
      cart.add({
        productId: item.id,
        name: item.name,
        slug: item.slug,
        price: Number(item.price),
        image: primaryImage?.url ?? product.image,
        vendorId: item.vendor.id,
        vendorName: item.vendor.storeName,
        categoryId: item.category.id,
        maxStock: item.stock,
      });
      if (andCheckout) router.push("/cart");
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }

  return <div className="group flex flex-col overflow-hidden rounded-card border border-graphite-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-graphite-700 dark:bg-graphite-900"><Link href={`/products/${product.slug}`} className="block"><div className="relative aspect-square w-full overflow-hidden bg-cloud-100 dark:bg-graphite-800">{product.video ? <ProductVideoPlayer src={product.video} poster={product.image} compact className="h-full w-full rounded-none" /> : <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />} {product.video && <span className="absolute left-2 bottom-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">Video</span>}{product.sponsored&&<span className="absolute left-2 top-2 rounded-full border border-graphite-200 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-graphite-700 shadow-sm">Sponsored</span>}{discount&&<span className="forge-tag absolute left-0 top-10 bg-ember-600 py-1 pl-2.5 pr-4 font-mono text-[11px] font-medium text-white">-{discount}%</span>}<div className="absolute right-2 top-2 flex flex-col items-end gap-1.5"><WishlistButton productId={product.id} size="sm" />{(product.sellingMethod === "whatsapp" || product.sellingMethod === "external")&&<span className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-graphite-700">{product.sellingMethod === "whatsapp"&&<MessageCircle className="h-3.5 w-3.5" />}{product.sellingMethod === "external"&&<ExternalLink className="h-3.5 w-3.5" />}</span>}</div></div><div className="flex flex-col gap-1.5 p-3"><p className="line-clamp-2 min-h-[2.6em] text-[13.5px] font-medium leading-snug text-graphite-900 dark:text-white">{product.name}</p><div className="flex items-baseline gap-2 font-mono"><span className="text-[15px] font-semibold text-graphite-900 dark:text-white">{formatNaira(product.price)}</span>{product.previousPrice&&<span className="text-xs text-graphite-400 line-through">{formatNaira(product.previousPrice)}</span>}</div>{(product.rating>0||product.reviewCount>0)&&<div className="flex items-center gap-1 text-xs text-graphite-600 dark:text-graphite-300"><Star className="h-3.5 w-3.5 fill-gold-600 text-gold-600"/><span>{product.rating}</span><span className="text-graphite-400">({product.reviewCount})</span></div>}<div className="mt-1"><DeliveryEstimate days={product.estimatedDeliveryDays ?? 7}/></div><div className="flex items-center gap-1 pt-1 text-xs text-graphite-600 dark:text-graphite-300">{product.verified&&<BadgeCheck className="h-3.5 w-3.5 shrink-0 text-verified-600" />}<span className="truncate">{product.vendor}</span><span className="text-graphite-300">·</span><span className="shrink-0 text-graphite-400">{product.location}</span></div></div></Link>{product.sellingMethod === "checkout" && <div className="grid grid-cols-2 gap-2 p-3 pt-0"><button type="button" onClick={() => void purchase(false)} disabled={busy !== null} className="flex min-w-0 items-center justify-center gap-1.5 rounded-card border border-graphite-300 px-2 py-2.5 text-[11px] font-semibold text-graphite-900 transition hover:bg-cloud-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-graphite-600 dark:text-white dark:hover:bg-graphite-800">{busy === "cart" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />}Add to cart</button><button type="button" onClick={() => void purchase(true)} disabled={busy !== null} className="flex min-w-0 items-center justify-center gap-1.5 rounded-card bg-ember-600 px-2 py-2.5 text-[11px] font-semibold text-white transition hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60">{busy === "buy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}{busy === "buy" ? "Opening…" : "Buy now"}</button></div>}{error && <p className="px-3 pb-3 text-[10px] font-medium text-ember-600">Couldn’t add this product. Please try again.</p>}</div>;
}

function ComingSoonCard({ product }: { product: Product }) {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    void api.get<{ productId: string; count: number; open: boolean }>(`/api/products/alerts/${encodeURIComponent(product.id)}/waitlist`)
      .then((result) => { if (active) setWaitlistCount(result.count); })
      .catch(() => { if (active) setWaitlistCount(null); });
    return () => { active = false; };
  }, [product.id]);

  return <Link href={`/products/${product.slug}`} className="group relative flex flex-col overflow-hidden rounded-[18px] border border-graphite-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-graphite-700 dark:bg-graphite-900"><div className="relative aspect-[4/3] overflow-hidden bg-graphite-900">{product.video ? <ProductVideoPlayer src={product.video} poster={product.image} compact className="h-full w-full rounded-none opacity-80" /> : <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw" className="object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />}<div className="absolute inset-0 bg-gradient-to-t from-graphite-950 via-graphite-950/30 to-transparent" /><div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-graphite-900"><Sparkles className="h-3 w-3" /> Coming Soon</div><div className="absolute bottom-3 left-3 right-3"><p className="text-lg font-bold text-white">{product.name}</p>{product.availableAt&&<p className="mt-1 text-xs font-medium text-white/80">Launching {new Date(product.availableAt).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</p>}</div></div><div className="flex items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="text-xs text-graphite-500 dark:text-graphite-400">{product.vendor}</p><p className="mt-1 text-sm font-semibold text-graphite-900 dark:text-white">Be first to know when it drops.</p>{waitlistCount !== null && <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-ember-700 dark:text-ember-400"><Users className="h-3.5 w-3.5" />{waitlistCount.toLocaleString()} {waitlistCount === 1 ? "person is" : "people are"} waiting</p>}</div><span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-graphite-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-graphite-900"><Bell className="h-3.5 w-3.5" /> Notify me</span></div></Link>;
}
