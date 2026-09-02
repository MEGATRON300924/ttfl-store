import Link from "next/link";
import * as Icons from "lucide-react";
import type { Category } from "@/lib/mock-data";

export function CategoryGrid({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {categories.map((category) => {
        const Icon =
          (Icons as any)[category.icon] ??
          Icons.Package;

        return (
          <Link
            key={category.id}
            href={`/shop?category=${encodeURIComponent(
              category.slug
            )}`}
            className="flex flex-col items-center gap-2 rounded-card border border-graphite-200 bg-white p-3 text-center transition hover:border-ember-600 hover:shadow-card"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cloud-100 text-graphite-700">
              <Icon className="h-5 w-5" />
            </span>

            <span className="text-[11.5px] font-medium leading-tight text-graphite-800">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
