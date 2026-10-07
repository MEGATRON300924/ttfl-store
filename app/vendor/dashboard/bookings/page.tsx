"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, Loader2, Save } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

type BookingSettings = {
  enabled: boolean;
  bookingUrl: string | null;
  bookingLabel: string | null;
  whatsappNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  instructions: string | null;
};

export default function BookingSetupPage() {
  const [form, setForm] = useState<BookingSettings>({
    enabled: false, bookingUrl: "", bookingLabel: "Book an appointment",
    whatsappNumber: "", phoneNumber: "", email: "", instructions: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void api.get<{ bookingSettings: BookingSettings }>("/api/vendors/me/booking-settings")
      .then(({ bookingSettings }) => setForm({
        enabled: Boolean(bookingSettings.enabled),
        bookingUrl: bookingSettings.bookingUrl || "",
        bookingLabel: bookingSettings.bookingLabel || "Book an appointment",
        whatsappNumber: bookingSettings.whatsappNumber || "",
        phoneNumber: bookingSettings.phoneNumber || "",
        email: bookingSettings.email || "",
        instructions: bookingSettings.instructions || "",
      }))
      .catch(e => setError(e instanceof ApiError ? e.message : "Couldn't load booking settings."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await api.put<{ bookingSettings: BookingSettings }>("/api/vendors/me/booking-settings", {
        enabled: form.enabled,
        bookingUrl: form.bookingUrl?.trim() || null,
        bookingLabel: form.bookingLabel?.trim() || null,
        whatsappNumber: form.whatsappNumber?.trim() || null,
        phoneNumber: form.phoneNumber?.trim() || null,
        email: form.email?.trim() || null,
        instructions: form.instructions?.trim() || null,
      });
      setForm(current => ({ ...current, ...result.bookingSettings, bookingUrl: result.bookingSettings.bookingUrl || "", bookingLabel: result.bookingSettings.bookingLabel || "Book an appointment", whatsappNumber: result.bookingSettings.whatsappNumber || "", phoneNumber: result.bookingSettings.phoneNumber || "", email: result.bookingSettings.email || "", instructions: result.bookingSettings.instructions || "" }));
      setMessage("Booking settings saved successfully.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save booking settings.");
    } finally { setSaving(false); }
  }

  if (loading) return <main className="shell py-16 text-center text-sm text-graphite-500"><Loader2 className="mx-auto animate-spin" size={18}/>Loading booking setup…</main>;

  return <main className="shell py-8">
    <div className="mx-auto max-w-4xl">
      <Link href="/vendor/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-600 hover:text-graphite-950"><ArrowLeft size={16}/>Back to dashboard</Link>
      <div className="mt-5 flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ember-100 text-ember-700"><CalendarDays size={20}/></span>
        <div><h1 className="text-2xl font-bold text-graphite-950 dark:text-white">Bookings setup</h1><p className="mt-1 text-sm text-graphite-500">Give customers a clear way to book appointments, consultations, services, inspections, or meetings with your business.</p></div>
      </div>

      {message && <div className="mt-6 flex items-center gap-2 rounded-2xl border border-verified-200 bg-verified-50 p-4 text-sm font-semibold text-verified-700"><CheckCircle2 size={18}/>{message}</div>}
      {error && <div className="mt-6 rounded-2xl border border-ember-200 bg-ember-50 p-4 text-sm font-semibold text-ember-700">{error}</div>}

      <section className="mt-7 rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm sm:p-6 dark:border-graphite-800 dark:bg-graphite-900">
        <div className="flex items-center justify-between gap-4">
          <div><h2 className="font-bold text-graphite-950 dark:text-white">Enable bookings</h2><p className="mt-1 text-sm text-graphite-500">Show a booking action on your storefront when you are ready.</p></div>
          <button type="button" onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))} aria-pressed={form.enabled} className={`relative h-7 w-12 rounded-full transition ${form.enabled ? "bg-ember-600" : "bg-graphite-300 dark:bg-graphite-700"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${form.enabled ? "left-6" : "left-1"}`}/></button>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm sm:p-6 dark:border-graphite-800 dark:bg-graphite-900">
        <h2 className="font-bold text-graphite-950 dark:text-white">Primary booking link</h2>
        <p className="mt-1 text-sm text-graphite-500">Use Calendly, Google Calendar booking pages, Setmore, your own website, or another booking provider.</p>
        <div className="mt-5 grid gap-5">
          <label className="text-sm font-semibold">Booking URL<input value={form.bookingUrl || ""} onChange={e => setForm(f => ({...f, bookingUrl:e.target.value}))} placeholder="https://..." className="mt-2 w-full rounded-xl border border-graphite-200 px-3.5 py-3 font-normal outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950"/></label>
          <label className="text-sm font-semibold">Button label<input value={form.bookingLabel || ""} onChange={e => setForm(f => ({...f, bookingLabel:e.target.value}))} placeholder="Book an appointment" maxLength={80} className="mt-2 w-full rounded-xl border border-graphite-200 px-3.5 py-3 font-normal outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950"/></label>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm sm:p-6 dark:border-graphite-800 dark:bg-graphite-900">
        <h2 className="font-bold text-graphite-950 dark:text-white">Other booking contacts</h2>
        <p className="mt-1 text-sm text-graphite-500">Add backup ways customers can arrange a booking.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">WhatsApp number<input value={form.whatsappNumber || ""} onChange={e => setForm(f => ({...f, whatsappNumber:e.target.value}))} placeholder="+234..." className="mt-2 w-full rounded-xl border border-graphite-200 px-3.5 py-3 font-normal outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950"/></label>
          <label className="text-sm font-semibold">Phone number<input value={form.phoneNumber || ""} onChange={e => setForm(f => ({...f, phoneNumber:e.target.value}))} placeholder="+234..." className="mt-2 w-full rounded-xl border border-graphite-200 px-3.5 py-3 font-normal outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950"/></label>
          <label className="text-sm font-semibold sm:col-span-2">Booking email<input type="email" value={form.email || ""} onChange={e => setForm(f => ({...f, email:e.target.value}))} placeholder="bookings@example.com" className="mt-2 w-full rounded-xl border border-graphite-200 px-3.5 py-3 font-normal outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950"/></label>
          <label className="text-sm font-semibold sm:col-span-2">Booking instructions<textarea value={form.instructions || ""} onChange={e => setForm(f => ({...f, instructions:e.target.value}))} rows={4} maxLength={1000} placeholder="Tell customers what they should know before booking..." className="mt-2 w-full resize-none rounded-xl border border-graphite-200 px-3.5 py-3 font-normal outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-950"/></label>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-ember-600 px-5 py-3 text-sm font-bold text-white hover:bg-ember-700 disabled:opacity-60"><Save size={17}/>{saving ? "Saving…" : "Save booking setup"}</button>
        {form.bookingUrl && <a href={form.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-graphite-200 px-5 py-3 text-sm font-semibold dark:border-graphite-700"><ExternalLink size={16}/>Test booking link</a>}
      </div>
    </div>
  </main>;
}
