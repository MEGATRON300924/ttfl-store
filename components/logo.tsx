import Link from "next/link";
import Image from "next/image";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const text = variant === "dark" ? "text-graphite-900" : "text-white";

  return (
    <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2" aria-label="TTFL Store home">
      <Image
        src="/ttflstore.png"
        alt="TTFL Store"
        width={110}
        height={28}
        priority
        sizes="110px"
        className="h-[28px] w-[110px] object-contain sm:h-[30px] sm:w-[118px]"
      />
      <span className={`font-sans text-[16px] font-bold tracking-tight ${text}`}>TTFL Store</span>
    </Link>
  );
}