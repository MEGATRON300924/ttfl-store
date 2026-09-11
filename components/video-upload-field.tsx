"use client";

import { useRef, useState } from "react";
import { Loader2, Play, Upload, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const MAX_VIDEOS = 3;

export type UploadedVideo = { url: string; publicId: string };

export function VideoUploadField({
  videos,
  onChange,
}: {
  videos: UploadedVideo[];
  onChange: (videos: UploadedVideo[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const remaining = MAX_VIDEOS - videos.length;
    if (remaining <= 0) return setError("You can add up to 3 product videos.");
    setUploading(true);

    const uploaded: UploadedVideo[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      const formData = new FormData();
      formData.append("video", file);
      try {
        const res = await fetch(`${API_URL}/api/uploads/product-video`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Video upload failed");
        uploaded.push({ url: json.url, publicId: json.publicId });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Video upload failed");
      }
    }

    onChange([...videos, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeVideo(index: number) {
    const video = videos[index];
    onChange(videos.filter((_, i) => i !== index));
    if (video.publicId.startsWith("existing-")) return;
    fetch(`${API_URL}/api/uploads/product-video/${encodeURIComponent(video.publicId)}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => undefined);
  }

  return (
    <div className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-sm font-semibold text-graphite-900 dark:text-white">Product videos</span>
          <p className="mt-1 text-xs leading-5 text-graphite-500 dark:text-graphite-400">Show the product in action with up to 3 short videos. Videos are optional.</p>
        </div>
        <span className="shrink-0 rounded-full bg-cloud-100 px-2 py-1 text-[10px] font-semibold text-graphite-600 dark:bg-graphite-800 dark:text-graphite-300">{videos.length}/3</span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {videos.map((video, index) => (
          <div key={video.publicId} className="group relative aspect-video overflow-hidden rounded-[8px] border border-graphite-200 bg-black dark:border-graphite-700">
            <video src={video.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-graphite-900 shadow-sm"><Play className="ml-0.5 h-3.5 w-3.5 fill-current" /></span>
            <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">Video {index + 1}</span>
            <button type="button" onClick={() => removeVideo(index)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-graphite-700 opacity-100 shadow-sm transition hover:bg-white" aria-label={`Remove video ${index + 1}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {videos.length < MAX_VIDEOS && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="flex aspect-video flex-col items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-graphite-300 text-graphite-500 transition hover:border-ember-600 hover:text-ember-600 disabled:opacity-60 dark:border-graphite-600">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-[11px] font-semibold">{uploading ? "Uploading…" : "Add video"}</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/ogg" multiple onChange={(event) => void handleFiles(event.target.files)} className="hidden" />
      {error && <p className="mt-2 text-xs text-ember-600">{error}</p>}
      <p className="mt-2 text-xs text-graphite-400">MP4, WebM, MOV, M4V, or OGG · up to 50MB per video.</p>
    </div>
  );
}
