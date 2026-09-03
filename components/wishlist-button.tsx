"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function WishlistButton({
  productId,
  size = "md",
  initialWishlisted = false,
}: {
  productId: string;
  size?: "sm" | "md";
  initialWishlisted?: boolean;
}) {
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const wishlisted = user ? wishlistIds.has(productId) : initialWishlisted;
  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  }

  return (
    <button
      onClick={toggle}
      className={`grid ${dim} place-items-center rounded-full bg-white/95 text-graphite-700 shadow-card transition hover:text-ember-600`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`${iconDim} ${wishlisted ? "fill-ember-600 text-ember-600" : ""}`} />
    </button>
  );
}
