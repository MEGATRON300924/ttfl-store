import Link from "next/link";
import Image from "next/image";

/**
 * NOTE: The spec requires the official "ttflstore.png" logo file to be used
 * everywhere a logo appears. That file wasn't included in this handoff, so
 * this component renders a wordmark placeholder with the exact same
 * dimensions/slot a real <Image> would take.
 *
 * To wire in the real logo:
 * 1. Drop ttflstore.png into /public/ttflstore.png
 * 2. Replace the placeholder <div> below with:
 *    <Image src="/ttflstore.png" alt="TTFL Store" width={132} height={32} priority />
 */
export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const text = variant === "dark" ? "text-graphite-900" : "text-white";
  const sub = variant === "dark" ? "text-graphite-600" : "text-graphite-200";
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="TTFL Store home">
      <span
        className={`grid h-8 w-8 place-items-center rounded-[6px] bg-ember-600 font-mono text-sm font-medium text-white`}
        aria-hidden
      >
        T
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-sans text-[15px] font-bold tracking-tight ${text}`}>
          TTFL Store
        </span>
        <span className={`text-[10px] font-medium tracking-wide ${sub}`}>
          THE TRON FORGE LIMITED
        </span>
      </span>
    </Link>
  );
}
