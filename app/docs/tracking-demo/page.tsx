"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, Car, Truck, Check, Package, MapPin, ExternalLink } from "lucide-react";

const checkpoints = [
  { number: 1, title: "Order confirmed", description: "Your order has been confirmed by the vendor." },
  { number: 2, title: "Order is being packaged", description: "The vendor is preparing your package." },
  { number: 3, title: "Order is being shipped", description: "Your package has left the vendor and is on its way." },
  { number: 4, title: "Order just arrived Destination country", description: "Your shipment has reached the destination country." },
  { number: 5, title: "Order is out for delivery", description: "A delivery rider is taking your package to you." },
];

export default function TrackingDemoPage() {
  const [active, setActive] = useState(5);
  const [vehicle, setVehicle] = useState("motorcycle");

  return (
    <div className="shell py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/docs" className="text-sm font-semibold text-ember-600 hover:text-ember-700">← Back to docs</Link>
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">Vendor training demo</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-graphite-900 dark:text-white">TTFL Store Tracking Demo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600 dark:text-graphite-400">Use this page to teach a new vendor how the five-checkpoint tracking system works.</p>
        </div>

        <div className="mt-7 rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><p className="text-xs text-graphite-500">Demo order</p><p className="mt-1 font-mono text-sm font-bold text-graphite-900 dark:text-white">TTFL-2026-DEMO01</p></div>
            <div><p className="text-xs text-graphite-500">Product ID</p><p className="mt-1 font-mono text-sm font-bold text-ember-600">TTFL-STORE-DEMO</p></div>
            <div><p className="text-xs text-graphite-500">Estimated delivery</p><p className="mt-1 text-sm font-bold text-graphite-900 dark:text-white">7 days from order/view time</p></div>
          </div>
        </div>

        <div className="mt-5 rounded-card border border-graphite-200 bg-white p-4 dark:border-graphite-700 dark:bg-graphite-900 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-bold text-graphite-900 dark:text-white">Select a checkpoint</h2><p className="mt-1 text-xs text-graphite-500">Vendors can select checkpoint 1, 2, 3, 4, or 5 directly.</p></div>
            <span className="rounded-full bg-ember-100 px-3 py-1 text-xs font-bold text-ember-700">Checkpoint {active}/5</span>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-5">
            {checkpoints.map((checkpoint) => <button key={checkpoint.number} type="button" onClick={() => setActive(checkpoint.number)} className={`rounded-card border p-3 text-left ${active === checkpoint.number ? "border-ember-600 bg-ember-100" : checkpoint.number < active ? "border-verified-600 bg-verified-100" : "border-graphite-200 dark:border-graphite-700"}`}><span className="font-mono text-xs font-bold text-ember-600">0{checkpoint.number}</span><p className="mt-1 text-xs font-semibold leading-5 text-graphite-900 dark:text-white">{checkpoint.title}</p></button>)}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-card border border-graphite-200 bg-white dark:border-graphite-700 dark:bg-graphite-900">
          <div className="relative h-[330px] overflow-hidden bg-cloud-100 dark:bg-graphite-950">
            <svg viewBox="0 0 900 400" className="absolute inset-0 h-full w-full" aria-label="Demo delivery route map">
              <path d="M80 310 C170 245 190 115 315 150 S465 315 565 205 S705 100 820 55" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeDasharray="2 22" className="text-graphite-300 dark:text-graphite-700" />
              <path d="M80 310 C170 245 190 115 315 150 S465 315 565 205 S705 100 820 55" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeDasharray="2 22" strokeDashoffset={Math.max(0, 100 - active * 20)} className="text-ember-600" />
              {[{x:80,y:310,n:1},{x:270,y:135,n:2},{x:440,y:285,n:3},{x:620,y:165,n:4},{x:820,y:55,n:5}].map((point) => <g key={point.n}><circle cx={point.x} cy={point.y} r="23" className={point.n <= active ? "fill-ember-600" : "fill-white dark:fill-graphite-900"} stroke="currentColor" strokeWidth="4" /><text x={point.x} y={point.y + 6} textAnchor="middle" fontSize="16" fontWeight="700" className={point.n <= active ? "fill-white" : "fill-graphite-600 dark:fill-graphite-300"}>{point.n}</text></g>)}
            </svg>
            <div className="absolute left-4 top-4 rounded-card border border-graphite-200 bg-white px-3 py-2 shadow-sm dark:border-graphite-700 dark:bg-graphite-900"><p className="text-xs font-bold text-graphite-900 dark:text-white">TTFL delivery route</p><p className="mt-0.5 text-[11px] text-graphite-500">Visual checkpoint map</p></div>
            <div className="absolute bottom-4 right-4 rounded-card border border-graphite-200 bg-white px-3 py-2 text-right shadow-sm dark:border-graphite-700 dark:bg-graphite-900"><p className="text-[11px] text-graphite-500">Destination</p><p className="text-xs font-bold text-graphite-900 dark:text-white">Nigeria</p></div>
          </div>

          <div className="grid gap-3 border-t border-graphite-100 p-4 dark:border-graphite-800 sm:grid-cols-5">
            {checkpoints.map((checkpoint) => <div key={checkpoint.number} className={`rounded-card border p-3 ${checkpoint.number <= active ? "border-ember-600 bg-ember-100" : "border-graphite-200 dark:border-graphite-700"}`}><div className="flex items-center gap-2">{checkpoint.number <= active ? <Check className="h-4 w-4 text-ember-600" /> : <Package className="h-4 w-4 text-graphite-400" />}<span className="font-mono text-xs font-bold text-ember-600">0{checkpoint.number}</span></div><p className="mt-2 text-xs font-semibold leading-5 text-graphite-900 dark:text-white">{checkpoint.title}</p><p className="mt-1 text-[11px] leading-4 text-graphite-500">{checkpoint.description}</p></div>)}
          </div>
        </div>

        <div className="mt-5 rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900">
          <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-ember-600" /><div><h2 className="font-bold text-graphite-900 dark:text-white">Checkpoint 5 delivery details</h2><p className="text-xs text-graphite-500">This is what a vendor can attach when the order is out for delivery.</p></div></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[{value:"motorcycle",label:"Motorcycle",Icon:Bike},{value:"car",label:"Car",Icon:Car},{value:"truck",label:"Truck",Icon:Truck}].map(({value,label,Icon})=><button key={value} type="button" onClick={() => setVehicle(value)} className={`flex items-center justify-center gap-2 rounded-card border p-3 text-sm font-semibold ${vehicle === value ? "border-ember-600 bg-ember-100 text-ember-700" : "border-graphite-200 dark:border-graphite-700 dark:text-graphite-300"}`}><Icon className="h-5 w-5" />{label}</button>)}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-card bg-cloud-100 p-3 dark:bg-graphite-950"><p className="text-xs text-graphite-500">Rider</p><p className="mt-1 text-sm font-semibold text-graphite-900 dark:text-white">David — 0803 000 0000</p></div><div className="rounded-card bg-cloud-100 p-3 dark:bg-graphite-950"><p className="text-xs text-graphite-500">Tracking link</p><p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ember-600">Delivery partner tracking <ExternalLink className="h-3.5 w-3.5" /></p></div></div>
        </div>

        <div className="mt-5 rounded-card border border-ember-200 bg-ember-100 p-5 text-sm text-ember-800">
          <p className="font-bold">Vendor workflow</p>
          <p className="mt-1 leading-6">Open Vendor Dashboard → Orders & Tracking → select the order → select the exact checkpoint you want to update → add the customer message → for checkpoint 5 add rider/vehicle or tracking information → save.</p>
        </div>
      </div>
    </div>
  );
}
