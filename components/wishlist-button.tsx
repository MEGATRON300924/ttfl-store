"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
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
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setPending(true);
    const next = !wishlisted;
    setWishlisted(next); // optimistic
    try {
      if (next) {
        await api.post("/api/wishlist", { productId });
      } else {
        await api.delete(`/api/wishlist/${productId}`);
      }
    } catch (err) {
      setWishlisted(!next); // revert on failure
      if (!(err instanceof ApiError)) console.error(err);
    } finally {
      setPending(false);
    }
  }

  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`grid ${dim} place-items-center rounded-full bg-white/95 text-graphite-700 shadow-card transition hover:text-ember-600 disabled:opacity-60`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`${iconDim} ${wishlisted ? "fill-ember-600 text-ember-600" : ""}`} />
    </button>
  );
}
