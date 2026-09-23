import Link from "next/link";
import Image from "next/image";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const text = variant === "dark" ? "text-graphite-900" : "text-white";
  const sub = variant === "dark" ? "text-graphite-600" : "text-graphite-200";

  return (
    <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2" aria-label="TTFL Store home">
      <Image
        src="/ttflstore.png"
        alt="TTFL Store"
        width={98}
        height={24}
        priority
        sizes="(max-width: 639px) 90px, 98px"
        className="h-[22px] w-[90px] object-contain sm:h-[24px] sm:w-[98px]"
      />
      <span className="hidden min-w-0 flex-col leading-none sm:flex">
        <span className={`font-sans text-[15px] font-bold tracking-tight ${text}`}>TTFL Store</span>
        <span className={`text-[10px] font-medium tracking-wide ${sub}`}>The Tron Forge Limited</span>
      </span>
    </Link>
  );
}