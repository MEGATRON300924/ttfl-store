"use client";

import { Bike, CarFront, Plane, Truck } from "lucide-react";

type VehicleType = "car" | "motorcycle" | "truck" | "plane" | string | null | undefined;

export default function TrackingVehicleAvatar({ type = "car", size = "md" }: { type?: VehicleType; size?: "sm" | "md" | "lg" }) {
  const vehicle = type === "motorcycle" ? "motorcycle" : type === "truck" ? "truck" : type === "plane" ? "plane" : "car";
  const sizes = {
    sm: { shell: "h-12 w-14 rounded-2xl", icon: "h-6 w-6", label: "text-[8px]" },
    md: { shell: "h-16 w-20 rounded-[20px]", icon: "h-8 w-8", label: "text-[9px]" },
    lg: { shell: "h-20 w-28 rounded-[24px]", icon: "h-10 w-10", label: "text-[10px]" },
  }[size];

  const Icon = vehicle === "motorcycle" ? Bike : vehicle === "truck" ? Truck : vehicle === "plane" ? Plane : CarFront;
  const label = vehicle === "motorcycle" ? "Rider" : vehicle === "truck" ? "Truck" : vehicle === "plane" ? "Flight" : "Delivery";

  return (
    <div role="img" aria-label={`TTFL ${label.toLowerCase()} vehicle`} className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-white/80 bg-white shadow-[0_10px_24px_rgba(15,23,42,.14)] ${sizes.shell}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-ember-50 via-white to-orange-100/70" />
      <div className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-ember-100/70 blur-md" />
      <div className="relative grid place-items-center rounded-xl bg-graphite-950 p-2 text-white shadow-sm">
        <Icon className={sizes.icon} strokeWidth={1.8} />
      </div>
      <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 font-bold uppercase tracking-[.16em] text-graphite-500 ${sizes.label}`}>{label}</span>
    </div>
  );
}
