import Link from "next/link";
import * as Icons from "lucide-react";
import type { Category } from "@/lib/mock-data";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {categories.map((c) => {
        const Icon = (Icons as any)[c.icon] ?? Icons.Package;
        return (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="flex flex-col items-center gap-2 rounded-card border border-graphite-200 bg-white p-3 text-center transition hover:border-ember-600 hover:shadow-card"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cloud-100 text-graphite-700">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[11.5px] font-medium leading-tight text-graphite-800">
              {c.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
