"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiUser } from "@/lib/api-types";

type AuthState = {
  user: ApiUser | null;
  loading: boolean;
  wishlistIds: Set<string>;
  refresh: () => Promise<void>;
  setAuthenticatedUser: (user: ApiUser) => void;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const authEpoch = useRef(0);
  const bootstrapPromise = useRef<Promise<void> | null>(null);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const { items } = await api.get<{ items: Array<{ productId: string }> }>("/api/wishlist");
      setWishlistIds(new Set(items.map((item) => item.productId)));
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) console.error(err);
    }
  }, [user]);

  const setAuthenticatedUser = useCallback((authenticatedUser: ApiUser) => {
    authEpoch.current += 1;
    setUser(authenticatedUser);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    if (!bootstrapPromise.current) {
      const epochAtStart = authEpoch.current;
      bootstrapPromise.current = (async () => {
        try {
          try {
            const { user } = await api.get<{ user: ApiUser }>("/api/auth/me");
            if (authEpoch.current === epochAtStart) setUser(user);
            return;
          } catch (err) {
            // A transient /me failure during a hard reload must not skip session
            // restoration. Always try the persistent refresh cookie before clearing auth.
            if (!(err instanceof ApiError && err.status === 401)) console.error("Auth bootstrap /me request failed; trying refresh cookie.", err);
          }

          await api.post("/api/auth/refresh");
          const { user } = await api.get<{ user: ApiUser }>("/api/auth/me");
          if (authEpoch.current === epochAtStart) setUser(user);
        } catch (err) {
          if (authEpoch.current === epochAtStart) {
            if (!(err instanceof ApiError && err.status === 401)) console.error(err);
            setUser(null);
          }
        } finally {
          if (authEpoch.current === epochAtStart) setLoading(false);
        }
      })().finally(() => {
        bootstrapPromise.current = null;
      });
    }
    return bootstrapPromise.current;
  }, []);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) {
      window.location.href = "/login";
      return false;
    }
    const next = !wishlistIds.has(productId);
    setWishlistIds((current) => {
      const updated = new Set(current);
      if (next) updated.add(productId);
      else updated.delete(productId);
      return updated;
    });
    try {
      if (next) await api.post("/api/wishlist", { productId });
      else await api.delete(`/api/wishlist/${productId}`);
      return next;
    } catch (err) {
      setWishlistIds((current) => {
        const updated = new Set(current);
        if (next) updated.delete(productId);
        else updated.add(productId);
        return updated;
      });
      if (!(err instanceof ApiError)) console.error(err);
      return !next;
    }
  }, [user, wishlistIds]);

  const logout = useCallback(async () => {
    authEpoch.current += 1;
    try { await api.post("/api/auth/logout"); } catch {}
    setUser(null);
    setWishlistIds(new Set());
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!user?.id) return;
    let lastSentAt = 0;
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastSentAt < 5 * 60 * 1000) return;
      lastSentAt = now;
      void api.post("/api/auth/activity").catch((error) => {
        if (error instanceof ApiError && error.status === 401) void refresh();
      });
    };
    recordActivity();
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll", "touchstart"];
    for (const event of events) window.addEventListener(event, recordActivity, { passive: true });
    return () => { for (const event of events) window.removeEventListener(event, recordActivity); };
  }, [user?.id, refresh]);

  useEffect(() => { if (!loading) void refreshWishlist(); }, [loading, refreshWishlist]);

  return (
    <AuthContext.Provider value={{ user, loading, wishlistIds, refresh, setAuthenticatedUser, refreshWishlist, toggleWishlist, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
