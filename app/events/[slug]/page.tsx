import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Building2, MapPin, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";

export default async function EventDetailPage({params}:{params:{slug:string}}){
  const result=await api.get<{event:any}>(`/api/partner-events/events/${params.slug}`).catch(()=>null);
  if(!result?.event) notFound();
  const e=result.event;
  return <div className="shell py-8 sm:py-10">
    <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-600 hover:text-graphite-900 dark:text-graphite-300 dark:hover:text-white"><ArrowLeft className="h-4 w-4"/>All events</Link>
    <div className="mt-5 overflow-hidden rounded-card border border-graphite-200 bg-white dark:border-graphite-700 dark:bg-graphite-900">
      {e.coverImageUrl&&<img src={e.coverImageUrl} alt="" className="max-h-[420px] w-full object-cover"/>}
      <div className="p-5 sm:p-8"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-ember-100 px-2.5 py-1 text-xs font-bold text-ember-700">{e.audience==="EVERYONE"?"Everyone":e.audience==="VENDORS"?"Vendors":"Customers"}</span><span className="rounded-full bg-cloud-100 px-2.5 py-1 text-xs font-bold text-graphite-700 dark:bg-graphite-800 dark:text-graphite-200">{e.eventType}</span></div><h1 className="mt-4 text-2xl font-extrabold tracking-tight text-graphite-900 dark:text-white sm:text-3xl">{e.title}</h1><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-graphite-700 dark:text-graphite-200">{e.description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><Info icon={<CalendarDays/>} label="Date & time" value={new Date(e.startsAt).toLocaleString()}/><Info icon={<Building2/>} label="Organizer" value={e.organizerName||e.partner.organizationName}/><Info icon={<Users/>} label="Who can join" value={e.audience==="EVERYONE"?"Vendors and customers":e.audience==="VENDORS"?"TTFL Store vendors":"TTFL Store customers"}/><Info icon={<MapPin/>} label="Location" value={e.location||"Virtual event"}/></div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">{e.registrationUrl?<a href={e.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-card bg-ember-600 px-5 py-3 text-sm font-extrabold text-white">Register / Join Event <ArrowUpRight className="h-4 w-4"/></a>:<span className="rounded-card bg-cloud-100 px-5 py-3 text-center text-sm font-semibold text-graphite-700 dark:bg-graphite-800 dark:text-graphite-200">Registration details coming soon</span>}<Link href="/events" className="rounded-card border border-graphite-200 px-5 py-3 text-center text-sm font-semibold text-graphite-900 dark:border-graphite-700 dark:text-white">Browse events</Link></div>
      </div>
    </div>
  </div>
}
function Info({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700"><div className="flex items-center gap-2 text-graphite-400">{icon}<span className="text-xs font-bold uppercase tracking-wide">{label}</span></div><p className="mt-2 text-sm font-semibold text-graphite-900 dark:text-white">{value}</p></div>}
