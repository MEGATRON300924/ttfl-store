"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api-client";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; ux_mode?: "popup" | "redirect" }) => void;
  renderButton: (element: HTMLElement, options: { type?: string; theme?: string; size?: string; width?: number; text?: string; shape?: string }) => void;
  cancel: () => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

export function GoogleSignIn({ onSuccess, onError }: { onSuccess: () => Promise<void>; onError: (message: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const { clientId } = await api.get<{ clientId: string | null }>("/api/auth/google/config");
        if (!clientId) {
          if (!cancelled) {
            setLoading(false);
            onError("Google Sign-In is not configured yet.");
          }
          return;
        }

        const render = () => {
          if (cancelled || !containerRef.current || !window.google?.accounts?.id) return;
          const googleId = window.google.accounts.id;
          googleId.initialize({
            client_id: clientId,
            ux_mode: "popup",
            callback: async ({ credential }) => {
              try {
                setLoading(true);
                await api.post("/api/auth/google", { credential });
                await onSuccess();
              } catch (error) {
                onError(error instanceof ApiError ? error.message : "Google Sign-In failed. Please try again.");
              } finally {
                if (!cancelled) setLoading(false);
              }
            },
          });
          containerRef.current.innerHTML = "";
          googleId.renderButton(containerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 384,
            text: "signin_with",
            shape: "rectangular",
          });
          setLoading(false);
        };

        if (window.google?.accounts?.id) {
          render();
          return;
        }

        const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
        if (existing) {
          existing.addEventListener("load", render, { once: true });
          const timer = window.setInterval(() => {
            if (window.google?.accounts?.id) {
              window.clearInterval(timer);
              render();
            }
          }, 100);
          return () => window.clearInterval(timer);
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = render;
        document.head.appendChild(script);
      } catch (error) {
        if (!cancelled) {
          setLoading(false);
          onError(error instanceof ApiError ? error.message : "Unable to load Google Sign-In.");
        }
      }
    }

    void setup();
    return () => {
      cancelled = true;
      window.google?.accounts?.id?.cancel();
    };
  }, [onError, onSuccess]);

  return (
    <div className="relative min-h-10">
      <div ref={containerRef} className="flex min-h-10 justify-center overflow-hidden" />
      {loading && <div className="absolute inset-0 grid place-items-center rounded-[7px] border border-graphite-200 bg-white text-sm text-graphite-600">Loading Google…</div>}
    </div>
  );
}
