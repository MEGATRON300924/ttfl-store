import Link from "next/link";
import { CalendarDays, ArrowRight, Building2, Users } from "lucide-react";
import { api } from "@/lib/api-client";

type EventItem = {
  id:string; title:string; slug:string; description:string; coverImageUrl:string|null;
  audience:"VENDORS"|"CUSTOMERS"|"EVERYONE"; startsAt:string; endsAt:string|null;
  eventType:string; location:string|null; registrationDeadline:string|null;
  partner:{organizationName:string;slug:string;logoUrl:string|null};
};

export default async function EventsPage(){
  const data=await api.get<{events:EventItem[]}>("/api/partner-events/events");
  return <div className="shell py-8 sm:py-10">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ember-600">TTFL Store</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-graphite-900 dark:text-white">Events & Opportunities</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600 dark:text-graphite-300">Discover trade fairs, exhibitions, networking events, training and other opportunities from verified TTFL Store partners.</p></div>
      <Link href="/partners" className="inline-flex items-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-900 dark:border-graphite-700 dark:text-white">Partner with TTFL Store <ArrowRight className="h-4 w-4"/></Link>
    </div>
    {data.events.length===0?<div className="mt-8 rounded-card border border-dashed border-graphite-200 p-10 text-center dark:border-graphite-700"><CalendarDays className="mx-auto h-9 w-9 text-graphite-400"/><p className="mt-3 font-semibold text-graphite-900 dark:text-white">No upcoming events yet</p><p className="mt-1 text-sm text-graphite-600 dark:text-graphite-300">New partner opportunities will appear here.</p></div>:
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.events.map(event=><Link href={`/events/${event.slug}`} key={event.id} className="overflow-hidden rounded-card border border-graphite-200 bg-white transition hover:-translate-y-0.5 hover:border-ember-500 hover:shadow-sm dark:border-graphite-700 dark:bg-graphite-900">
      {event.coverImageUrl?<img src={event.coverImageUrl} alt="" className="h-44 w-full object-cover"/>:<div className="grid h-44 place-items-center bg-cloud-100 dark:bg-graphite-800"><CalendarDays className="h-10 w-10 text-graphite-400"/></div>}
      <div className="p-4"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-ember-100 px-2 py-1 text-[11px] font-bold text-ember-700">{event.audience==="EVERYONE"?"Everyone":event.audience==="VENDORS"?"Vendors":"Customers"}</span><span className="rounded-full bg-cloud-100 px-2 py-1 text-[11px] font-bold text-graphite-700 dark:bg-graphite-800 dark:text-graphite-200">{event.eventType}</span></div><h2 className="mt-3 font-extrabold text-graphite-900 dark:text-white">{event.title}</h2><p className="mt-1 line-clamp-2 text-sm text-graphite-600 dark:text-graphite-300">{event.description}</p><div className="mt-4 space-y-2 text-xs text-graphite-600 dark:text-graphite-300"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4"/> {new Date(event.startsAt).toLocaleString()}</p><p className="flex items-center gap-2"><Building2 className="h-4 w-4"/> {event.partner.organizationName}</p><p className="flex items-center gap-2"><Users className="h-4 w-4"/> {event.audience==="EVERYONE"?"Vendors & customers":event.audience==="VENDORS"?"TTFL Store vendors":"TTFL Store customers"}</p></div></div>
    </Link>)}</div>}
  </div>
}
