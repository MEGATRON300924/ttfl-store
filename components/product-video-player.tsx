"use client";

import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { optimizeVideoUrl } from "@/lib/media";

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ProductVideoPlayer({
  src,
  poster,
  className = "",
  compact = false,
}: {
  src: string;
  poster?: string;
  className?: string;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onTime = () => setCurrent(video.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play().catch(() => undefined);
    else video.pause();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrent(value);
  }

  async function fullscreen() {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    else await container.requestFullscreen?.().catch(() => undefined);
  }

  const progress = duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;

  return (
    <div ref={containerRef} onClick={(event) => event.stopPropagation()} className={`group relative overflow-hidden rounded-card bg-black ${className}`}>
      <video
        ref={videoRef}
        src={optimizeVideoUrl(src)}
        poster={poster}
        playsInline
        preload={compact ? "metadata" : "auto"}
        className="h-full w-full object-contain"
        onClick={() => void togglePlay()}
        aria-label="Product video"
      />

      {!playing && (
        <button type="button" onClick={() => void togglePlay()} className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-graphite-900 shadow-lg transition hover:scale-105 ${compact ? "h-11 w-11" : "h-14 w-14"}`} aria-label="Play video">
          <Play className={compact ? "ml-0.5 h-5 w-5 fill-current" : "ml-0.5 h-6 w-6 fill-current"} />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-2 pt-8 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <div className="mb-1.5 flex items-center gap-2">
          <button type="button" onClick={() => void togglePlay()} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/90 text-graphite-900" aria-label={playing ? "Pause video" : "Play video"}>
            {playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
          </button>
          <input type="range" min={0} max={duration || 0} step={0.1} value={current} onChange={(event) => seek(Number(event.target.value))} className="h-1.5 min-w-0 flex-1 accent-white" aria-label="Video progress" style={{ background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,.3) ${progress}%)` }} />
          {!compact && <span className="shrink-0 text-[10px] font-medium tabular-nums text-white/90">{formatTime(current)} / {formatTime(duration)}</span>}
          <button type="button" onClick={toggleMute} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur" aria-label={muted ? "Unmute video" : "Mute video"}>{muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}</button>
          <button type="button" onClick={() => void fullscreen()} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur" aria-label="Fullscreen video"><Maximize2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  );
}
