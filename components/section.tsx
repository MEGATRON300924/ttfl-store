import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Section({
  title,
  subtitle,
  href,
  hrefLabel = "See all",
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 sm:py-10">
      <div className="shell">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-graphite-900 sm:text-xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-graphite-600">{subtitle}</p>
            )}
          </div>
          {href && (
            <Link
              href={href}
              className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-ember-600 hover:text-ember-700"
            >
              {hrefLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
