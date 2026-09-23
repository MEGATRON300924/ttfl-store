import Link from "next/link";
import Image from "next/image";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const text = variant === "dark" ? "text-graphite-900" : "text-white";
  const sub = variant === "dark" ? "text-graphite-600" : "text-graphite-200";

  return (
    <Link href="/" className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2" aria-label="TTFL Store home">
      <Image
        src="/ttflstore.png"
        alt="TTFL Store"
        width={90}
        height={22}
        priority
        className="h-[18px] w-[74px] sm:h-[22px] sm:w-[90px]"
      />
      <span className="hidden min-w-0 flex-col leading-none sm:flex">
        <span className={`font-sans text-[15px] font-bold tracking-tight ${text}`}>TTFL Store</span>
        <span className={`text-[10px] font-medium tracking-wide ${sub}`}>The Tron Forge Limited</span>
      </span>
    </Link>
  );
}
