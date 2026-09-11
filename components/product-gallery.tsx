"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { ApiProductImage } from "@/lib/api-types";
import { isVideoUrl } from "@/lib/media";
import { ProductVideoPlayer } from "@/components/product-video-player";

export function ProductGallery({ images, productName }: { images: ApiProductImage[]; productName: string }) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex] ?? sorted[0];
  const poster = sorted.find((item) => !isVideoUrl(item.url))?.url;

  if (!active) {
    return <div className="aspect-square rounded-card bg-cloud-100" />;
  }

  const activeIsVideo = isVideoUrl(active.url);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card border border-graphite-200 bg-cloud-100">
        {activeIsVideo ? (
          <ProductVideoPlayer src={active.url} poster={poster} className="h-full w-full rounded-none" />
        ) : (
          <Image src={active.url} alt={productName} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
        )}
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {sorted.map((img, i) => {
            const video = isVideoUrl(img.url);
            return (
              <button key={img.id} onClick={() => setActiveIndex(i)} className={`relative aspect-square overflow-hidden rounded-[6px] border ${i === activeIndex ? "border-ember-600" : "border-graphite-200"}`} aria-label={video ? `View product video ${i + 1}` : `View image ${i + 1}`}>
                {video ? <><video src={img.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/20"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-graphite-900"><Play className="ml-0.5 h-3.5 w-3.5 fill-current" /></span></span></> : <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
