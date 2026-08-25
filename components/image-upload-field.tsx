"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, GripVertical, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type UploadedImage = { url: string; publicId: string };

export function ImageUploadField({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    const uploaded: UploadedImage[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        // credentials: include so the vendor's auth cookie rides along —
        // this isn't going through lib/api-client since that helper
        // always JSON-encodes the body, which multipart uploads can't use.
        const res = await fetch(`${API_URL}/api/uploads/product-image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Upload failed");
        uploaded.push({ url: json.url, publicId: json.publicId });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }

    onChange([...images, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove(index: number) {
    const image = images[index];
    onChange(images.filter((_, i) => i !== index));
    if (image.publicId.startsWith("existing-")) {
      // Loaded from an existing product's saved URLs, not a real
      // Cloudinary asset this session uploaded — nothing to delete
      // remotely, and calling the API with a fake ID would just 404.
      return;
    }
    // Best-effort cleanup — a failed delete just leaves an orphaned
    // Cloudinary asset, never blocks the product edit.
    fetch(`${API_URL}/api/uploads/product-image/${encodeURIComponent(image.publicId)}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => undefined);
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDrop(index: number) {
    if (dragIndex.current === null || dragIndex.current === index) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(index, 0, moved);
    onChange(reordered);
    dragIndex.current = null;
  }

  return (
    <div>
      <span className="text-sm font-medium text-graphite-700">Product images</span>

      <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {images.map((img, i) => (
          <div
            key={img.publicId}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="group relative aspect-square overflow-hidden rounded-[7px] border border-graphite-200 bg-cloud-100"
          >
            <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded-tag bg-graphite-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Primary
              </span>
            )}
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-graphite-700 opacity-0 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
            <span className="absolute bottom-1 left-1 text-white/70 opacity-0 group-hover:opacity-100">
              <GripVertical className="h-3.5 w-3.5" />
            </span>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[7px] border border-dashed border-graphite-300 text-graphite-500 hover:border-ember-600 hover:text-ember-600 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-[11px]">{uploading ? "Uploading…" : "Add photo"}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && <p className="mt-1.5 text-xs text-ember-600">{error}</p>}
      <p className="mt-1.5 text-xs text-graphite-400">
        JPEG, PNG, WebP, or AVIF, up to 5MB each. Drag to reorder — the first photo is the primary image.
      </p>
    </div>
  );
}
