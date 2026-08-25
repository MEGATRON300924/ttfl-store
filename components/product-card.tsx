import Image from "next/image";
import Link from "next/link";
import { Star, BadgeCheck, MessageCircle, ExternalLink } from "lucide-react";
import { formatNaira, type Product } from "@/lib/mock-data";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.previousPrice && product.previousPrice > product.price
      ? Math.round(100 - (product.price / product.previousPrice) * 100)
      : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-graphite-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cloud-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {discount && (
          <span className="forge-tag absolute left-0 top-3 bg-ember-600 py-1 pl-2.5 pr-4 font-mono text-[11px] font-medium text-white">
            -{discount}%
          </span>
        )}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
          <WishlistButton productId={product.id} size="sm" />
          {(product.sellingMethod === "whatsapp" || product.sellingMethod === "external") && (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-graphite-700">
              {product.sellingMethod === "whatsapp" && <MessageCircle className="h-3.5 w-3.5" />}
              {product.sellingMethod === "external" && <ExternalLink className="h-3.5 w-3.5" />}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 min-h-[2.6em] text-[13.5px] font-medium leading-snug text-graphite-900">
          {product.name}
        </p>

        <div className="flex items-baseline gap-2 font-mono">
          <span className="text-[15px] font-semibold text-graphite-900">
            {formatNaira(product.price)}
          </span>
          {product.previousPrice && (
            <span className="text-xs text-graphite-400 line-through">
              {formatNaira(product.previousPrice)}
            </span>
          )}
        </div>

        {(product.rating > 0 || product.reviewCount > 0) && (
          <div className="flex items-center gap-1 text-xs text-graphite-600">
            <Star className="h-3.5 w-3.5 fill-gold-600 text-gold-600" />
            <span>{product.rating}</span>
            <span className="text-graphite-400">({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-auto flex items-center gap-1 pt-1 text-xs text-graphite-600">
          {product.verified && (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-verified-600" />
          )}
          <span className="truncate">{product.vendor}</span>
          <span className="text-graphite-300">·</span>
          <span className="shrink-0 text-graphite-400">{product.location}</span>
        </div>
      </div>
    </Link>
  );
}
