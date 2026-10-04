"use client";

type VehicleType = "car" | "motorcycle" | "truck" | "plane" | string | null | undefined;

export default function TrackingVehicleAvatar({ type = "car", size = "md" }: { type?: VehicleType; size?: "sm" | "md" | "lg" }) {
  const vehicle = type === "motorcycle" ? "motorcycle" : type === "truck" ? "truck" : type === "plane" ? "plane" : "car";
  const box = size === "lg" ? { w: 128, h: 92 } : size === "sm" ? { w: 72, h: 54 } : { w: 96, h: 68 };

  if (vehicle === "motorcycle") {
    return (
      <svg viewBox="0 0 160 100" width={box.w} height={box.h} role="img" aria-label="TTFL motorcycle delivery rider" className="drop-shadow-[0_8px_7px_rgba(15,23,42,.18)]">
        <defs>
          <linearGradient id="ttfl-bike-body" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fb923c"/><stop offset=".55" stopColor="#f97316"/><stop offset="1" stopColor="#c2410c"/></linearGradient>
          <linearGradient id="ttfl-bike-seat" x1="0" x2="1"><stop offset="0" stopColor="#475569"/><stop offset="1" stopColor="#111827"/></linearGradient>
          <filter id="ttfl-bike-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity=".2"/></filter>
        </defs>
        <ellipse cx="80" cy="89" rx="57" ry="6" fill="#94a3b8" opacity=".28"/>
        <g filter="url(#ttfl-bike-shadow)">
          <circle cx="35" cy="70" r="18" fill="#111827"/><circle cx="35" cy="70" r="9" fill="#cbd5e1"/><circle cx="35" cy="70" r="4" fill="#64748b"/>
          <circle cx="126" cy="70" r="18" fill="#111827"/><circle cx="126" cy="70" r="9" fill="#cbd5e1"/><circle cx="126" cy="70" r="4" fill="#64748b"/>
          <path d="M35 70 L58 42 L98 43 L126 70 L84 70 Z" fill="url(#ttfl-bike-body)"/>
          <path d="M58 42 L73 27 L96 31 L106 46 L82 51 Z" fill="#ea580c"/>
          <path d="M62 40 L77 31 L94 34 L101 43 L78 45 Z" fill="#fb923c" opacity=".7"/>
          <path d="M57 43 L48 34 L55 29 L69 38 Z" fill="#1f2937"/>
          <path d="M92 30 L108 20 L112 24 L99 36 Z" fill="#334155"/>
          <path d="M107 18 L121 21" stroke="#111827" strokeWidth="4" strokeLinecap="round"/>
          <path d="M83 51 L72 70 M95 50 L108 70" stroke="#475569" strokeWidth="5" strokeLinecap="round"/>
          <path d="M62 39 C65 17 88 12 101 29 L99 40 L91 33 L78 30 L70 42 Z" fill="#0f172a"/>
          <path d="M73 19 C79 10 96 11 101 22 L95 29 L80 27 Z" fill="#fb923c"/>
          <path d="M79 27 L94 28 L98 36 L78 34 Z" fill="#e0f2fe" opacity=".9"/>
          <path d="M69 39 L58 48" stroke="#0f172a" strokeWidth="6" strokeLinecap="round"/>
          <path d="M56 47 L47 50" stroke="#0f172a" strokeWidth="5" strokeLinecap="round"/>
          <rect x="48" y="48" width="20" height="12" rx="4" fill="url(#ttfl-bike-seat)"/>
          <path d="M55 49 L64 42" stroke="#111827" strokeWidth="5" strokeLinecap="round"/>
        </g>
        <circle cx="139" cy="48" r="4" fill="#fef3c7"/><circle cx="139" cy="48" r="7" fill="#f59e0b" opacity=".18"/>
      </svg>
    );
  }

  if (vehicle === "plane") {
    return <svg viewBox="0 0 120 80" width={box.w} height={box.h} role="img" aria-label="Plane delivery vehicle" className="drop-shadow-[0_7px_6px_rgba(15,23,42,.15)]"><path d="M60 8 L69 35 L108 47 L106 53 L67 47 L62 72 L54 72 L53 47 L14 53 L12 47 L51 35 Z" fill="#38bdf8"/><path d="M58 14 L62 34 L93 44 L91 47 L62 43 L59 65 L56 65 L55 43 L28 47 L26 44 L54 34 Z" fill="#e0f2fe"/><circle cx="59" cy="39" r="5" fill="#0369a1"/></svg>;
  }

  if (vehicle === "truck") {
    return <svg viewBox="0 0 140 90" width={box.w} height={box.h} role="img" aria-label="Truck delivery vehicle" className="drop-shadow-[0_7px_6px_rgba(15,23,42,.15)]"><rect x="12" y="27" width="82" height="38" rx="7" fill="#f97316"/><path d="M94 39 H116 L130 52 V65 H94Z" fill="#334155"/><rect x="104" y="43" width="19" height="13" rx="2" fill="#bae6fd"/><circle cx="39" cy="68" r="12" fill="#111827"/><circle cx="39" cy="68" r="5" fill="#cbd5e1"/><circle cx="108" cy="68" r="12" fill="#111827"/><circle cx="108" cy="68" r="5" fill="#cbd5e1"/><rect x="25" y="34" width="45" height="5" rx="2.5" fill="#fff" opacity=".8"/></svg>;
  }

  return <svg viewBox="0 0 140 90" width={box.w} height={box.h} role="img" aria-label="Car delivery vehicle" className="drop-shadow-[0_7px_6px_rgba(15,23,42,.15)]"><path d="M17 59 L27 37 Q30 31 38 30 H91 Q99 31 104 37 L120 54 Q124 58 122 64 H17Z" fill="#f97316"/><path d="M37 35 H87 L98 49 H29Z" fill="#bae6fd"/><circle cx="39" cy="64" r="12" fill="#111827"/><circle cx="39" cy="64" r="5" fill="#cbd5e1"/><circle cx="101" cy="64" r="12" fill="#111827"/><circle cx="101" cy="64" r="5" fill="#cbd5e1"/><rect x="21" y="52" width="14" height="5" rx="2.5" fill="#fef3c7"/><rect x="108" y="52" width="10" height="5" rx="2.5" fill="#fecaca"/></svg>;
}
