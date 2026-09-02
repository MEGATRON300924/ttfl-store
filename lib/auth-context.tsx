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
      try {
        const { user } = await api.get<{ user: ApiUser }>("/api/auth/me");

        setUser(user);
        return;
      } catch (err) {
        /*
         * Access token may have expired.
         *
         * Only try the refresh session when /me
         * returns a 401 Unauthorized response.
         */
        if (!(err instanceof ApiError && err.status === 401)) {
          console.error(err);
          setUser(null);
          return;
        }
      }

      /*
       * Access token expired.
       * Refresh the session using the httpOnly cookie.
       */
      await api.post("/api/auth/refresh");

      /*
       * The backend has now issued a fresh access token.
       * Retry /me using the new token.
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
      /*
       * Always stop the loading state.
       *
       * This is important because /api/auth/me can succeed
       * without entering the refresh-token flow.
       */
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