"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { Paintbrush } from "lucide-react";
import { api } from "@/lib/api-client";
export function StoreBuilderEntry({storeSlug}:{storeSlug:string}){const[allowed,setAllowed]=useState(false);useEffect(()=>{void api.get<{allowed:boolean}>("/api/store-builder/access").then(r=>setAllowed(r.allowed)).catch(()=>setAllowed(false));},[]);if(!allowed)return null;return <Link href={`/vendor/dashboard/store-builder?store=${encodeURIComponent(storeSlug)}`} className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2.5 text-xs font-bold text-graphite-900 shadow-lg hover:bg-white"><Paintbrush className="h-4 w-4 text-ember-600"/>Customize Store</Link>;}
