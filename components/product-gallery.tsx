"use client";

import { useState } from "react";
import Image from "next/image";
import type { ApiProductImage } from "@/lib/api-types";

export function ProductGallery({ images, productName }: { images: ApiProductImage[]; productName: string }) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex] ?? sorted[0];

  if (!active) {
    return <div className="aspect-square rounded-card bg-cloud-100" />;
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card border border-graphite-200 bg-cloud-100">
        <Image
          src={active.url}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-[6px] border ${
                i === activeIndex ? "border-ember-600" : "border-graphite-200"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
