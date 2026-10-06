"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, ImagePlus, Pencil, Save, Trash2, Video, X } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

type EventForm = {
  title: string;
  description: string;
  coverImageUrl: string;
  videoUrl: string;
  audience: string;
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  eventType: string;
  location: string;
  registrationUrl: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
};

const emptyForm: EventForm = {
  title: "",
  description: "",
  coverImageUrl: "",
  videoUrl: "",
  audience: "EVERYONE",
  startsAt: "",
  endsAt: "",
  registrationDeadline: "",
  eventType: "Virtual",
  location: "",
  registrationUrl: "",
  organizerName: "",
  organizerEmail: "",
  organizerPhone: "",
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default function PartnerDashboard() {
  const [partner, setPartner] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);

  async function load() {
    try {
      const r = await api.get<{ partner: any; events: any[] }>("/api/partner-events/partners/me/events");
      setPartner(r.partner);
      setEvents(r.events);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load partner portal.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditingEventId(null);
    setCoverImage(null);
    setVideoFile(null);
    setForm({ ...emptyForm });
  }

  function startEditing(event: any) {
    setEditingEventId(event.id);
    setCoverImage(null);
    setVideoFile(null);
    setError("");
    setMessage("");
    setForm({
      title: event.title ?? "",
      description: event.description ?? "",
      coverImageUrl: event.coverImageUrl ?? "",
      videoUrl: event.videoUrl ?? "",
      audience: event.audience ?? "EVERYONE",
      startsAt: toDateTimeLocal(event.startsAt),
      endsAt: toDateTimeLocal(event.endsAt),
      registrationDeadline: toDateTimeLocal(event.registrationDeadline),
      eventType: event.eventType ?? "Virtual",
      location: event.location ?? "",
      registrationUrl: event.registrationUrl ?? "",
      organizerName: event.organizerName ?? "",
      organizerEmail: event.organizerEmail ?? "",
      organizerPhone: event.organizerPhone ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadMedia(file: File, expected: "image" | "video") {
    const body = new FormData();
    body.append("media", file);
    const uploaded = await api.post<{ url: string; resourceType: "image" | "video" }>(
      "/api/uploads/partner-event-media",
      body
    );
    if (uploaded.resourceType !== expected) {
      throw new Error(expected === "image"
        ? "The event image upload returned an invalid media type."
        : "The event video upload returned an invalid media type.");
    }
    return uploaded.url;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      let coverImageUrl = form.coverImageUrl;
      let videoUrl = form.videoUrl;

      if (coverImage) coverImageUrl = await uploadMedia(coverImage, "image");
      if (videoFile) videoUrl = await uploadMedia(videoFile, "video");

      const payload = {
        ...form,
        coverImageUrl: coverImageUrl || undefined,
        videoUrl: videoUrl || undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        registrationDeadline: form.registrationDeadline
          ? new Date(form.registrationDeadline).toISOString()
          : undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        registrationUrl: form.registrationUrl || undefined,
      };

      if (editingEventId) {
        const r = await api.patch<{ event: any; message: string }>(
          `/api/partner-events/partners/me/events/${editingEventId}`,
          payload
        );
        setEvents((current) => current.map((event) => event.id === editingEventId ? r.event : event));
        setMessage(r.message);
      } else {
        const r = await api.post<{ event: any; message: string }>(
          "/api/partner-events/partners/me/events",
          payload
        );
        setEvents((current) => [r.event, ...current]);
        setMessage(r.message);
      }

      resetForm();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not save event.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteEvent(event: any) {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const r = await api.delete<{ message: string }>(
        `/api/partner-events/partners/me/events/${event.id}`
      );
      setEvents((current) => current.filter((item) => item.id !== event.id));
      if (editingEventId === event.id) resetForm();
      setMessage(r.message);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete event.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !partner) {
    return <div className="shell py-16 text-center text-sm text-ember-700">{error}</div>;
  }

  const editing = Boolean(editingEventId);

  return (
    <div className="shell py-8 sm:py-10">
      <Link
        href="/partners"
        className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-600 dark:text-graphite-300"
      >
        <ArrowLeft className="h-4 w-4" /> Partner portal
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          {editing ? "Edit event" : "Submit an event"}
        </h1>
        <p className="mt-2 text-sm text-graphite-600 dark:text-graphite-300">
          {partner?.organizationName} · {partner?.eventPlan} Event Plan
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 space-y-4 rounded-card border border-graphite-200 bg-white p-5 dark:border-graphite-700 dark:bg-graphite-900"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event name">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </Field>
          <Field label="Event type">
            <input value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="input" placeholder="Virtual / Exhibition / Training" />
          </Field>
        </div>

        <Field label="Description">
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-32" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Who can join">
            <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="input">
              <option value="EVERYONE">Vendors & customers</option>
              <option value="VENDORS">Vendors only</option>
              <option value="CUSTOMERS">Customers only</option>
            </select>
          </Field>
          <Field label="Start">
            <input required type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="input" />
          </Field>
          <Field label="End (optional)">
            <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="input" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Registration link">
            <input type="url" value={form.registrationUrl} onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} className="input" placeholder="https://" />
          </Field>
          <Field label={editing ? "Replace event image (optional)" : "Event image"}>
            <div className="rounded-card border border-dashed border-graphite-300 p-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-card border border-graphite-300 px-3 py-2 text-sm font-semibold">
                <ImagePlus className="h-4 w-4" /> {coverImage ? coverImage.name : "Upload image"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
              </label>
              <p className="mt-1 text-xs text-graphite-500">JPEG, PNG, WebP or AVIF · max 5MB</p>
            </div>
          </Field>
        </div>

        <Field label={editing ? "Replace event video (optional)" : "Event video (optional)"}>
          <div className="rounded-card border border-dashed border-graphite-300 p-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-card border border-graphite-300 px-3 py-2 text-sm font-semibold">
              <Video className="h-4 w-4" /> {videoFile ? videoFile.name : "Upload video"}
              <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/ogg" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
            </label>
            <p className="mt-1 text-xs text-graphite-500">MP4, WebM, MOV, M4V or OGG · max 50MB</p>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="Virtual event" />
          </Field>
          <Field label="Registration deadline">
            <input type="datetime-local" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} className="input" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Organizer name">
            <input value={form.organizerName} onChange={(e) => setForm({ ...form, organizerName: e.target.value })} className="input" />
          </Field>
          <Field label="Organizer email">
            <input type="email" value={form.organizerEmail} onChange={(e) => setForm({ ...form, organizerEmail: e.target.value })} className="input" />
          </Field>
          <Field label="Organizer phone">
            <input value={form.organizerPhone} onChange={(e) => setForm({ ...form, organizerPhone: e.target.value })} className="input" />
          </Field>
        </div>

        {error && <p className="rounded-card bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
        {message && <p className="rounded-card bg-verified-100 px-3 py-2 text-sm text-verified-700">{message}</p>}

        <div className="flex flex-wrap gap-2">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-card bg-ember-600 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60">
            {editing ? <Save className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
            {busy ? "Saving..." : editing ? "Save changes" : "Submit event for review"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} disabled={busy} className="inline-flex items-center gap-2 rounded-card border border-graphite-300 px-5 py-3 text-sm font-extrabold text-graphite-800 dark:border-graphite-600 dark:text-white">
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </form>

      <section className="mt-8">
        <h2 className="text-lg font-extrabold text-graphite-900 dark:text-white">Your events</h2>
        <div className="mt-3 space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col gap-3 rounded-card border border-graphite-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-graphite-700 dark:bg-graphite-900">
              <div className="min-w-0">
                <p className="font-bold text-graphite-900 dark:text-white">{event.title}</p>
                <p className="text-xs text-graphite-600 dark:text-graphite-300">{new Date(event.startsAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cloud-100 px-2.5 py-1 text-xs font-bold dark:bg-graphite-800">{event.status}</span>
                <button type="button" onClick={() => startEditing(event)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-card border border-graphite-300 px-3 py-2 text-xs font-bold text-graphite-800 disabled:opacity-50 dark:border-graphite-600 dark:text-white">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button type="button" onClick={() => void deleteEvent(event)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-card border border-ember-300 px-3 py-2 text-xs font-bold text-ember-700 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
          {!events.length && <p className="rounded-card border border-dashed border-graphite-300 p-5 text-sm text-graphite-500">You have not submitted any events yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-graphite-800 dark:text-graphite-100">{label}</span>
      {children}
    </label>
  );
}
