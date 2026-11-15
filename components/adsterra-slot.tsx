"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type AdsterraOptions = {
  key: string;
  format: "iframe";
  height: number;
  width: number;
  params: Record<string, never>;
};

declare global {
  interface Window {
    atOptions?: AdsterraOptions;
  }
}

// Adsterra's supplied snippets share the global atOptions name. Serialize
// loading so one placement cannot overwrite another placement's configuration.
let adsterraLoadQueue: Promise<void> = Promise.resolve();

function enqueueAdsterraScript(host: HTMLElement, options: AdsterraOptions) {
  const task = adsterraLoadQueue.then(() => new Promise<void>((resolve) => {
    if (!host.isConnected) {
      resolve();
      return;
    }

    window.atOptions = options;
    const script = document.createElement("script");
    script.src = `https://bauval.org/22/${options.key}`;
    script.async = false;
    script.setAttribute("data-cfasync", "false");
    script.onload = () => resolve();
    script.onerror = () => {
      console.error(`TTFL Store: Adsterra placement ${options.key} failed to load.`);
      resolve();
    };
    host.appendChild(script);
  }));

  adsterraLoadQueue = task.catch(() => undefined);
  return task;
}

const restrictedPath = (path: string) =>
  /^\/(checkout|cart|account|vendor|admin|auth|login)(\/|$)/i.test(path);

export function AdsterraSlot({
  id,
  adKey,
  width,
  height,
  className = "",
}: {
  id: string;
  adKey: string;
  width: number;
  height: number;
  className?: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (restrictedPath(pathname ?? "")) return;
    const host = document.getElementById(id);
    if (!host) return;

    void enqueueAdsterraScript(host, {
      key: adKey,
      format: "iframe",
      height,
      width,
      params: {},
    });

    return () => {
      host.replaceChildren();
    };
  }, [adKey, height, id, pathname, width]);

  if (restrictedPath(pathname ?? "")) return null;

  return (
    <section
      aria-label="Advertisement"
      className={className}
    >
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-graphite-400">
        Advertisement
      </p>
      <div
        id={id}
        className="mx-auto flex w-full items-center justify-center overflow-hidden"
        style={{ minHeight: height, maxWidth: width }}
      />
    </section>
  );
}
