"use client";

import { Plane } from "lucide-react";

type VehicleType = "car" | "motorcycle" | "truck" | "plane" | string | null | undefined;

export default function TrackingVehicleAvatar({ type = "car", size = "md" }: { type?: VehicleType; size?: "sm" | "md" | "lg" }) {
  const vehicle = type === "motorcycle" ? "motorcycle" : type === "truck" ? "truck" : type === "plane" ? "plane" : "car";
  const scale = size === "lg" ? "h-24 w-32" : size === "sm" ? "h-12 w-16" : "h-16 w-24";

  if (vehicle === "plane") {
    return <div className={`relative ${scale} [perspective:500px]`} aria-label="Plane delivery vehicle">
      <div className="absolute inset-x-3 top-5 h-7 rotate-x-[55deg] rounded-[45%] bg-sky-400 shadow-[0_10px_14px_rgba(15,23,42,.18)]" />
      <div className="absolute left-1/2 top-0 h-16 w-3 -translate-x-1/2 rotate-[-20deg] rounded-full bg-sky-500 shadow-md" />
      <div className="absolute left-1/2 top-5 h-10 w-16 -translate-x-1/2 rounded-[50%] bg-white/80 shadow-inner" />
      <div className="absolute left-1/2 top-8 h-3 w-20 -translate-x-1/2 rounded-full bg-sky-300" />
      <Plane className="absolute left-1/2 top-6 h-8 w-8 -translate-x-1/2 rotate-90 text-sky-700" />
    </div>;
  }

  if (vehicle === "motorcycle") {
    return <div className={`relative ${scale} [perspective:500px]`} aria-label="Motorcycle delivery vehicle">
      <div className="absolute bottom-3 left-2 h-7 w-7 rounded-full border-[6px] border-graphite-800 bg-graphite-300 shadow-md" />
      <div className="absolute bottom-3 right-2 h-7 w-7 rounded-full border-[6px] border-graphite-800 bg-graphite-300 shadow-md" />
      <div className="absolute bottom-7 left-5 h-3 w-14 -rotate-6 rounded-full bg-ember-600 shadow-[0_5px_7px_rgba(15,23,42,.18)]" />
      <div className="absolute bottom-10 left-8 h-4 w-7 -rotate-12 rounded-md bg-graphite-800" />
      <div className="absolute bottom-12 right-5 h-8 w-2 rotate-12 rounded-full bg-graphite-700" />
      <div className="absolute bottom-14 right-3 h-2 w-7 rotate-12 rounded-full bg-graphite-900" />
    </div>;
  }

  if (vehicle === "truck") {
    return <div className={`relative ${scale} [perspective:500px]`} aria-label="Truck delivery vehicle">
      <div className="absolute bottom-5 left-1 h-8 w-20 skew-x-[-5deg] rounded-md bg-ember-600 shadow-[0_9px_12px_rgba(15,23,42,.2)]" />
      <div className="absolute bottom-5 right-1 h-10 w-8 skew-x-[-5deg] rounded-r-lg bg-graphite-700 shadow-[0_9px_12px_rgba(15,23,42,.2)]" />
      <div className="absolute bottom-8 right-3 h-4 w-5 rounded-sm bg-sky-200" />
      <div className="absolute bottom-1 left-4 h-7 w-7 rounded-full border-[6px] border-graphite-900 bg-graphite-300" />
      <div className="absolute bottom-1 right-5 h-7 w-7 rounded-full border-[6px] border-graphite-900 bg-graphite-300" />
      <div className="absolute bottom-12 left-5 h-2 w-12 rounded bg-white/80" />
    </div>;
  }

  return <div className={`relative ${scale} [perspective:500px]`} aria-label="Car delivery vehicle">
    <div className="absolute bottom-5 left-2 h-8 w-24 rounded-[45%_45%_22%_22%] bg-ember-600 shadow-[0_9px_12px_rgba(15,23,42,.2)]" />
    <div className="absolute bottom-10 left-7 h-7 w-14 rounded-t-[80%] bg-sky-200 shadow-inner" />
    <div className="absolute bottom-1 left-5 h-7 w-7 rounded-full border-[6px] border-graphite-900 bg-graphite-300" />
    <div className="absolute bottom-1 right-4 h-7 w-7 rounded-full border-[6px] border-graphite-900 bg-graphite-300" />
    <div className="absolute bottom-7 left-4 h-2 w-5 rounded bg-yellow-200" />
    <div className="absolute bottom-7 right-3 h-2 w-4 rounded bg-red-200" />
  </div>;
}
