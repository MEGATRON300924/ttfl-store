import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://ttflstore.name.ng";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const metadata: Metadata = { title: "Contact delivery driver | TTFL Store", description: "Securely contact the delivery driver assigned to your TTFL Store order." };

async function getContact(token: string) {
  const response = await fetch(`${API_URL}/api/orders/driver-contact/${encodeURIComponent(token)}`, { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  return data.contact as { storeName: string; storeSlug: string; riderName: string; riderPhone: string };
}

export default async function DriverContactPage({ params }: { params: { token: string } }) {
  const contact = await getContact(params.token);
  if (!contact) return <main className="shell py-16"><div className="mx-auto max-w-xl rounded-card border border-graphite-200 bg-white p-6 text-center"><h1 className="text-2xl font-bold text-graphite-900">Driver contact unavailable</h1><p className="mt-2 text-sm leading-6 text-graphite-600">This secure link may have expired, the driver may no longer be assigned, or a driver phone number has not been added yet.</p><Link href="/orders/track" className="mt-5 inline-flex rounded-card bg-ember-600 px-5 py-3 text-sm font-semibold text-white">Track my order</Link></div></main>;
  const phone = contact.riderPhone.replace(/\D/g, "");
  const whatsapp = `https://wa.me/${phone}`;
  return <main className="shell py-16"><div className="mx-auto max-w-xl rounded-card border border-graphite-200 bg-white p-6 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ember-600">TTFL delivery</p><h1 className="mt-2 text-3xl font-bold text-graphite-900">Contact your driver</h1><p className="mt-2 text-sm text-graphite-600">{contact.riderName} · {contact.storeName}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><a href={`tel:+${phone}`} className="rounded-card bg-ember-600 px-5 py-3 text-sm font-semibold text-white">Call driver</a><a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-card border border-graphite-200 px-5 py-3 text-sm font-semibold text-graphite-900">WhatsApp driver</a></div><p className="mt-5 text-xs text-graphite-500">For your security, TTFL does not expose the driver's number until a delivery assignment is active.</p><Link href={`${SITE_URL}/orders/track`} className="mt-4 inline-block text-sm font-semibold text-ember-600">Back to tracking</Link></div></main>;
}
