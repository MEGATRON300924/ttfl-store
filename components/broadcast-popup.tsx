"use client";

import { useEffect, useState } from "react";
import { X, Megaphone } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function BroadcastPopup() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  useEffect(() => { if (!user) return; api.get<{ items: any[] }>("/api/broadcast/popup").then(r => setItems(r.items)).catch(() => undefined); }, [user]);
  if (!items.length || index >= items.length) return null;
  const item = items[index];
  return <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-md rounded-card border border-graphite-200 bg-white p-5 shadow-2xl"><button onClick={() => setItems([])} className="absolute right-3 top-3 text-graphite-500" aria-label="Close"><X className="h-5 w-5" /></button><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-100 text-ember-700"><Megaphone className="h-5 w-5" /></span><div className="pr-5"><h2 className="font-bold text-graphite-900">{item.title}</h2><p className="mt-1 whitespace-pre-line text-sm leading-6 text-graphite-700">{item.message}</p>{items.length > 1 && <button onClick={() => setIndex(i => i + 1)} className="mt-3 text-xs font-semibold text-ember-600">Next announcement</button>}</div></div></div>;
}
