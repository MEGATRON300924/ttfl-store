"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, ApiError } from "@/lib/api-client";
import type { ApiUser } from "@/lib/api-types";

type AuthState = {
  user: ApiUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      /*
       * First try the current access token.
       */
      const { user } = await api.get<{ user: ApiUser }>("/api/auth/me");

      setUser(user);
      return;
    } catch (err) {
      /*
       * Access token may have expired.
       *
       * Try the refresh session before deciding the user
       * is actually logged out.
       */
      if (!(err instanceof ApiError && err.status === 401)) {
        console.error(err);
        setUser(null);
        return;
      }
    }

    try {
      /*
       * Refresh token lives in the httpOnly cookie.
       * The browser sends it automatically because api-client
       * uses credentials: "include".
       */
      await api.post("/api/auth/refresh");

      /*
       * The backend has now issued a fresh access token.
       * Retry /me using the new cookie.
       */
      const { user } = await api.get<{ user: ApiUser }>("/api/auth/me");

      setUser(user);
    } catch (err) {
      /*
       * Only now do we consider the session genuinely expired.
       */
      if (!(err instanceof ApiError && err.status === 401)) {
        console.error(err);
      }

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Logout should still clear local state if the API fails.
    }

    setUser(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
