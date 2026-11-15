"use client";

import { useEffect } from "react";

/**
 * Temporary homepage-only Adsterra banner test.
 * Keep this placement off account, checkout and other transactional routes.
 */
export function AdsterraBanner() {
  useEffect(() => {
    const host = document.getElementById("ttfl-adsterra-banner");
    if (!host || document.getElementById("ttfl-adsterra-banner-script")) return;

    // Adsterra's generated placement configuration.
    (window as Window & {
      atOptions?: {
        key: string;
        format: string;
        height: number;
        width: number;
        params: Record<string, never>;
      };
    }).atOptions = {
      key: "f9d1b757d3620d5040d3839181db1c80",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.id = "ttfl-adsterra-banner-script";
    script.src = "https://bauval.org/22/f9d1b757d3620d5040d3839181db1c80";
    script.async = true;
    host.appendChild(script);

    return () => {
      script.remove();
      host.replaceChildren();
      delete (window as Window & { atOptions?: unknown }).atOptions;
    };
  }, []);

  return (
    <section
      aria-label="Advertisement"
      className="shell my-5 flex min-h-[90px] justify-center overflow-hidden"
    >
      <div
        id="ttfl-adsterra-banner"
        className="flex min-h-[90px] w-full max-w-[728px] items-center justify-center overflow-hidden"
      />
    </section>
  );
}
