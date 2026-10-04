"use client";

type VehicleType =
  | "car"
  | "motorcycle"
  | "truck"
  | "plane"
  | "bus"
  | "helicopter"
  | "sportscar"
  | "suv"
  | "pickup"
  | string
  | null
  | undefined;

const VEHICLE_ASSETS: Record<string, { light: string; dark: string; label: string }> = {
  motorcycle: { light: "/motorbike-blue.svg", dark: "/motorbike-white.svg", label: "Rider" },
  car: { light: "/car-blue.svg", dark: "/car-white.svg", label: "Delivery" },
  sportscar: { light: "/sportscar-blue.svg", dark: "/sportscar-white.svg", label: "Sportscar" },
  suv: { light: "/suv-blue.svg", dark: "/suv-white.svg", label: "SUV" },
  pickup: { light: "/pickup-blue.svg", dark: "/pickup-white.svg", label: "Pickup" },
  truck: { light: "/pickup-blue.svg", dark: "/pickup-white.svg", label: "Truck" },
  bus: { light: "/bus-blue.svg", dark: "/bus-white.svg", label: "Bus" },
  plane: { light: "/plane-blue.svg", dark: "/plane-white.svg", label: "Flight" },
  helicopter: { light: "/helicopter-blue.svg", dark: "/helicopter-white.svg", label: "Helicopter" },
};

export default function TrackingVehicleAvatar({
  type = "car",
  size = "md",
}: {
  type?: VehicleType;
  size?: "sm" | "md" | "lg";
}) {
  const vehicle = VEHICLE_ASSETS[type || "car"] ?? VEHICLE_ASSETS.car;
  const sizes = {
    sm: { shell: "h-12 w-14 rounded-2xl", image: "h-10 w-12", label: "text-[8px]" },
    md: { shell: "h-16 w-20 rounded-[20px]", image: "h-14 w-[68px]", label: "text-[9px]" },
    lg: { shell: "h-20 w-28 rounded-[24px]", image: "h-[72px] w-24", label: "text-[10px]" },
  }[size];

  return (
    <div
      role="img"
      aria-label={`TTFL ${vehicle.label.toLowerCase()} vehicle`}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-graphite-100/80 bg-white/90 shadow-[0_10px_24px_rgba(15,23,42,.10)] backdrop-blur-sm dark:border-graphite-700/80 dark:bg-graphite-900/90 ${sizes.shell}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-ember-50/70 via-white to-sky-50/80 dark:from-graphite-900 dark:via-graphite-900 dark:to-graphite-800" />
      <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-ember-100/50 blur-xl dark:bg-ember-900/20" />
      <picture className="relative z-10 block">
        <source media="(prefers-color-scheme: dark)" srcSet={vehicle.dark} />
        <img src={vehicle.light} alt="" className={`${sizes.image} object-contain drop-shadow-[0_5px_6px_rgba(15,23,42,.18)] dark:drop-shadow-[0_5px_8px_rgba(0,0,0,.45)]`} />
      </picture>
      <span className={`absolute bottom-1 left-1/2 z-20 -translate-x-1/2 font-bold uppercase tracking-[.16em] text-graphite-500 dark:text-graphite-400 ${sizes.label}`}>
        {vehicle.label}
      </span>
    </div>
  );
}
