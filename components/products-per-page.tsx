"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [12, 24, 36, 48];

export function ProductsPerPage({
  value,
}: {
  value: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeLimit(nextLimit: string) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("limit", nextLimit);
    params.set("page", "1");

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="products-per-page"
        className="text-sm text-graphite-600"
      >
        Products per page
      </label>

      <select
        id="products-per-page"
        value={String(value)}
        onChange={(event) =>
          changeLimit(event.target.value)
        }
        className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2 text-sm font-medium text-graphite-800 outline-none focus:border-ember-600"
      >
        {OPTIONS.map((size) => (
          <option
            key={size}
            value={size}
          >
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
