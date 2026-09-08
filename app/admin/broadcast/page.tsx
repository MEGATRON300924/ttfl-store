"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FileText, Megaphone, MessageSquareText, Send, Smartphone, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type WhatsAppAudience = "ADMINS" | "CUSTOMERS";
type WhatsAppType = "TEXT" | "TEMPLATE";

type TemplatePreset = {
  id: string;
  name: string;
  audience: WhatsAppAudience;
  label: string;
  language: string;
  body: string;
  parameters: string[];
};

const TEMPLATE_PRESETS: TemplatePreset[] = [
  { id: "order-confirmed", name: "order_confirmed", audience: "CUSTOMERS", label: "Order confirmed", language: "en_US", body: "Hi {{1}}, your TTFL Store order {{2}} has been confirmed. Total: ₦{{3}}. We'll keep you updated as your order progresses.", parameters: ["Customer first name", "Order number", "Order total"] },
  { id: "order-shipped", name: "order_shipped", audience: "CUSTOMERS", label: "Order shipped", language: "en_US", body: "Hi {{1}}, your TTFL Store order {{2}} has shipped and is now on its way. Track your order using the button below.", parameters: ["Customer first name", "Order number"] },
  { id: "out-for-delivery", name: "order_out_for_delivery", audience: "CUSTOMERS", label: "Out for delivery", language: "en_US", body: "Your TTFL Store order {{1}} is out for delivery. Please keep your phone available so the delivery rider can reach you.", parameters: ["Order number"] },
  { id: "order-delivered", name: "order_delivered", audience: "CUSTOMERS", label: "Order delivered", language: "en_US", body: "Your TTFL Store order {{1}} has been delivered successfully. Thank you for shopping with TTFL Store!", parameters: ["Order number"] },
  { id: "payment-failed", name: "payment_failed", audience: "CUSTOMERS", label: "Payment failed", language: "en_US", body: "We couldn't confirm the payment for TTFL Store order {{1}}. Please check your payment method and try again.", parameters: ["Order number"] },
  { id: "admin-new-order", name: "admin_new_order", audience: "ADMINS", label: "New order — Admin", language: "en_US", body: "New TTFL Store order {{1}} from {{2}} for ₦{{3}}. Please review the order in the admin dashboard.", parameters: ["Order number", "Customer name", "Order total"] },
  { id: "admin-vendor-application", name: "new_vendor_application", audience: "ADMINS", label: "New vendor application", language: "en_US", body: "A new vendor application has been submitted. Store: {{1}}. Applicant: {{2}}. Please review it in the admin dashboard.", parameters: ["Store name", "Applicant name"] },
  { id: "admin-payment-alert", name: "admin_payment_alert", audience: "ADMINS", label: "Payment alert — Admin", language: "en_US", body: "Payment failed for TTFL Store order {{1}}. Please review the order and payment status in the admin dashboard.", parameters: ["Order number"] },
  { id: "announcement-customer", name: "store_announcement", audience: "CUSTOMERS", label: "General announcement", language: "en_US", body: "Hi {{1}}, {{2}} — TTFL Store", parameters: ["Customer first name", "Announcement text"] },
];

export default function BroadcastPage() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState("ALL");
  const [days, setDays] = useState("7");
  const [popup, setPopup] = useState(true);
  const [email, setEmail] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [status, setStatus] = useState("");
  const [testStatus, setTestStatus] = useState("");
  const [testing, setTesting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [whatsappAudience, setWhatsappAudience] = useState<WhatsAppAudience>("CUSTOMERS");
  const [whatsappType, setWhatsappType] = useState<WhatsAppType>("TEXT");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateLanguage, setTemplateLanguage] = useState("en_US");
  const [bodyParameters, setBodyParameters] = useState("");
  const [buttonUrlParameters, setButtonUrlParameters] = useState("");
  const [templatePreview, setTemplatePreview] = useState("");
  const [whatsappStatus, setWhatsappStatus] = useState("");
  const [whatsappSending, setWhatsappSending] = useState(false);

  async function load() {
    try { const result = await api.get<{ items: any[] }>("/api/broadcast/admin"); setHistory(result.items); } catch {}
  }
  useEffect(() => { if (user?.role === "ADMIN") void load(); }, [user]);

  const availablePresets = useMemo(() => TEMPLATE_PRESETS.filter(template => template.audience === whatsappAudience), [whatsappAudience]);

  function applyTemplate(template: TemplatePreset) {
    setWhatsappType("TEMPLATE");
    setTemplateName(template.name);
    setTemplateLanguage(template.language);
    setTemplatePreview(template.body);
    setBodyParameters(template.parameters.map((parameter, index) => `${index + 1}. ${parameter}`).join("\n"));
    setButtonUrlParameters("");
  }

  async function testWhatsApp() {
    setTesting(true); setTestStatus("Testing WhatsApp connection...");
    try {
      const result = await api.post<{ ok: boolean }>("/api/broadcast/admin/test-whatsapp", {});
      setTestStatus(result.ok ? "WhatsApp test sent successfully to the configured admin number(s)." : "WhatsApp test failed.");
    } catch (error) { setTestStatus(error instanceof Error ? `WhatsApp test failed: ${error.message}` : "WhatsApp test failed."); }
    finally { setTesting(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setStatus("Sending...");
    try {
      const result = await api.post<{ recipientCount: number; whatsappSent: number; whatsappFailed: number; whatsappSkipped: number }>("/api/broadcast/admin", { title, message, emailSubject: subject || undefined, sendPopup: popup, sendEmail: email, sendWhatsApp: whatsapp, audience: { mode, days: Number(days) } });
      const whatsappResult = whatsapp ? ` WhatsApp: ${result.whatsappSent} sent, ${result.whatsappFailed} failed, ${result.whatsappSkipped} without phone.` : "";
      setStatus(`Broadcast created for ${result.recipientCount} users.${whatsappResult}`); setTitle(""); setMessage(""); setSubject(""); await load();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Broadcast failed"); }
  }

  async function sendDedicatedWhatsApp(event: FormEvent) {
    event.preventDefault(); setWhatsappStatus("Sending WhatsApp notification..."); setWhatsappSending(true);
    try {
      const result = await api.post<{ sent: number; failed: number; skipped: number; error?: string }>("/api/broadcast/admin/whatsapp", {
        audience: whatsappAudience, type: whatsappType,
        message: whatsappType === "TEXT" ? whatsappMessage : undefined,
        templateName: whatsappType === "TEMPLATE" ? templateName : undefined,
        templateLanguage: whatsappType === "TEMPLATE" ? templateLanguage : undefined,
        bodyParameters: whatsappType === "TEMPLATE" ? bodyParameters.split("\n").map(value => value.trim()).filter(Boolean) : undefined,
        buttonUrlParameters: whatsappType === "TEMPLATE" ? buttonUrlParameters.split("\n").map(value => value.trim()).filter(Boolean) : undefined,
      });
      setWhatsappStatus(`${result.sent} sent · ${result.skipped} missing WhatsApp number · ${result.failed} failed${result.error ? ` · ${result.error}` : ""}`);
      if (result.sent > 0) await load();
    } catch (error) { setWhatsappStatus(error instanceof Error ? error.message : "WhatsApp notification failed"); }
    finally { setWhatsappSending(false); }
  }

  if (loading) return <div className="shell py-16 text-center">Loading...</div>;
  if (!user || user.role !== "ADMIN") return <div className="shell py-16 text-center"><h1 className="font-bold">Admin access only</h1></div>;

  return <div className="shell py-8">
    <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-card bg-ember-100 text-ember-700"><Megaphone className="h-5 w-5" /></span><div><h1 className="text-xl font-bold">Broadcast Center</h1><p className="text-sm text-graphite-600">Target users with popup announcements, Resend email, and WhatsApp.</p></div></div>

    <section className="mt-6 max-w-3xl rounded-card border border-graphite-200 p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-bold">WhatsApp connection</h2><p className="mt-1 text-sm text-graphite-600">Test the Meta WhatsApp Cloud API using the configured admin number(s).</p></div><button type="button" onClick={testWhatsApp} disabled={testing} className="inline-flex items-center gap-2 rounded-card border border-graphite-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"><Smartphone className="h-4 w-4" /> {testing ? "Testing..." : "Test WhatsApp — Admins"}</button></div>{testStatus && <p className="mt-3 text-sm text-graphite-600">{testStatus}</p>}</section>

    <section className="mt-6 max-w-3xl rounded-card border border-graphite-200 p-6">
      <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-green-100 text-green-700"><MessageSquareText className="h-5 w-5" /></span><div><h2 className="text-lg font-bold">WhatsApp Notifications</h2><p className="mt-1 text-sm text-graphite-600">Send a dedicated WhatsApp message without changing the popup or email broadcast settings.</p></div></div>
      <form onSubmit={sendDedicatedWhatsApp} className="mt-6 space-y-5">
        <div><label className="text-sm font-semibold">Send to</label><div className="mt-2 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setWhatsappAudience("ADMINS")} className={`flex items-center gap-3 rounded-card border p-4 text-left ${whatsappAudience === "ADMINS" ? "border-green-600 bg-green-50" : "border-graphite-200"}`}><Users className="h-5 w-5" /><span><strong className="block">Only admins</strong><span className="text-xs text-graphite-600">Configured admin WhatsApp numbers</span></span></button><button type="button" onClick={() => setWhatsappAudience("CUSTOMERS")} className={`flex items-center gap-3 rounded-card border p-4 text-left ${whatsappAudience === "CUSTOMERS" ? "border-green-600 bg-green-50" : "border-graphite-200"}`}><Users className="h-5 w-5" /><span><strong className="block">Only customers</strong><span className="text-xs text-graphite-600">Active customers with a saved phone number</span></span></button></div></div>
        <div><label className="text-sm font-semibold">Message type</label><div className="mt-2 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setWhatsappType("TEMPLATE")} className={`flex items-center gap-3 rounded-card border p-4 text-left ${whatsappType === "TEMPLATE" ? "border-green-600 bg-green-50" : "border-graphite-200"}`}><FileText className="h-5 w-5" /><span><strong className="block">Template</strong><span className="text-xs text-graphite-600">Meta-approved WhatsApp template</span></span></button><button type="button" onClick={() => setWhatsappType("TEXT")} className={`flex items-center gap-3 rounded-card border p-4 text-left ${whatsappType === "TEXT" ? "border-green-600 bg-green-50" : "border-graphite-200"}`}><MessageSquareText className="h-5 w-5" /><span><strong className="block">Normal text</strong><span className="text-xs text-graphite-600">Regular WhatsApp announcement</span></span></button></div></div>
        {whatsappType === "TEMPLATE" ? <div className="space-y-4 rounded-card bg-cloud-50 p-4">
          <div><div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold">Template starter</label><span className="text-xs text-graphite-500">Use only if the same template exists in Meta</span></div><div className="mt-2 flex flex-wrap gap-2">{availablePresets.map(template => <button key={template.id} type="button" onClick={() => applyTemplate(template)} className="rounded-tag border border-graphite-200 bg-white px-3 py-1.5 text-xs font-semibold hover:border-ember-500">{template.label}</button>)}</div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-sm font-semibold">Template name</label><input value={templateName} onChange={e => setTemplateName(e.target.value)} required={whatsappType === "TEMPLATE"} placeholder="e.g. order_confirmed" className="mt-1 w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5" /></div><div><label className="text-sm font-semibold">Language</label><input value={templateLanguage} onChange={e => setTemplateLanguage(e.target.value)} required={whatsappType === "TEMPLATE"} placeholder="en_US" className="mt-1 w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5" /></div></div>
          <div><label className="text-sm font-semibold">Body variables</label><textarea value={bodyParameters} onChange={e => setBodyParameters(e.target.value)} rows={4} placeholder="One value per line, in Meta template order" className="mt-1 w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5" /><p className="mt-1 text-xs text-graphite-500">Enter one value per line. These values are sent as {"{{1}}"}, {"{{2}}"}, {"{{3}}"}, etc.</p></div>
          <div><label className="text-sm font-semibold">Button URL variables <span className="font-normal text-graphite-500">(optional)</span></label><textarea value={buttonUrlParameters} onChange={e => setButtonUrlParameters(e.target.value)} rows={2} placeholder="One URL variable per line, in Meta button order" className="mt-1 w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5" /></div>
          <div><label className="text-sm font-semibold">Template preview</label><textarea value={templatePreview} onChange={e => setTemplatePreview(e.target.value)} rows={4} placeholder="Paste the approved Meta template body here for your own reference" className="mt-1 w-full rounded-card border border-graphite-200 bg-white px-3 py-2.5" /></div>
          <p className="text-xs text-graphite-500">Template names, language codes, variable order, and buttons must match the approved Meta template exactly. The starter buttons above are copy-ready examples, not automatically-created Meta templates.</p>
        </div> : <div>
          <div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold">Normal WhatsApp message</label><span className="text-xs text-graphite-500">{whatsappMessage.length}/4096</span></div>
          <textarea value={whatsappMessage} onChange={e => setWhatsappMessage(e.target.value.slice(0, 4096))} required={whatsappType === "TEXT"} rows={8} maxLength={4096} placeholder={whatsappAudience === "ADMINS" ? "e.g. 📢 Admin announcement..." : "e.g. 📢 TTFL Store announcement..."} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" />
          <p className="mt-1 text-xs text-graphite-500">Normal text can be delivered when Meta allows free-form messaging for the recipient. For outbound messages outside the customer service window, use an approved template.</p>
        </div>}
        <button type="submit" disabled={whatsappSending} className="inline-flex items-center gap-2 rounded-card bg-green-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4" /> {whatsappSending ? "Sending..." : `Send to ${whatsappAudience === "ADMINS" ? "admins" : "customers"}`}</button>
        {whatsappStatus && <div className="rounded-card border border-graphite-200 bg-cloud-50 p-3 text-sm text-graphite-700">{whatsappStatus}</div>}
      </form>
    </section>

    <form onSubmit={submit} className="mt-6 max-w-3xl space-y-5 rounded-card border border-graphite-200 p-6">
      <div><label className="text-sm font-semibold">Title</label><input value={title} onChange={e => setTitle(e.target.value)} required maxLength={160} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" /></div>
      <div><label className="text-sm font-semibold">Message</label><textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6} maxLength={10000} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" /></div>
      <div><label className="text-sm font-semibold">Audience</label><select value={mode} onChange={e => setMode(e.target.value)} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5"><option value="ALL">All active users</option><option value="NEW">New users</option><option value="EXISTING">Existing users</option><option value="VERIFIED">Verified email users</option><option value="UNVERIFIED">Unverified email users</option><option value="VENDORS">Vendors</option><option value="CUSTOMERS">Customers</option></select></div>
      {(mode === "NEW" || mode === "EXISTING") && <div><label className="text-sm font-semibold">Age window in days</label><input type="number" min="1" max="3650" value={days} onChange={e => setDays(e.target.value)} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" /></div>}
      <div className="grid gap-3 sm:grid-cols-3"><label className="flex items-center gap-2 rounded-card border border-graphite-200 p-3"><input type="checkbox" checked={popup} onChange={e => setPopup(e.target.checked)} /> Popup notification</label><label className="flex items-center gap-2 rounded-card border border-graphite-200 p-3"><input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} /> Email via Resend</label><label className="flex items-center gap-2 rounded-card border border-graphite-200 p-3"><input type="checkbox" checked={whatsapp} onChange={e => setWhatsapp(e.target.checked)} /> WhatsApp</label></div>
      {email && <div><label className="text-sm font-semibold">Email subject</label><input value={subject} onChange={e => setSubject(e.target.value)} required={email} maxLength={200} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2.5" /></div>}
      {whatsapp && <p className="text-xs text-graphite-500">WhatsApp messages are sent only to users with a saved phone number. Meta may require an approved WhatsApp message template for outbound messages outside an active customer conversation.</p>}
      <button type="submit" className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-5 py-2.5 text-sm font-semibold text-white"><Send className="h-4 w-4" /> Send broadcast</button>
      {status && <p className="text-sm text-graphite-600">{status}</p>}
    </form>

    <section className="mt-8"><h2 className="font-bold">Recent broadcasts</h2><div className="mt-3 space-y-2">{history.map(item => <div key={item.id} className="rounded-card border border-graphite-200 p-4"><div className="flex justify-between gap-4"><strong>{item.title}</strong><span className="text-xs text-graphite-500">{new Date(item.createdAt).toLocaleString()}</span></div><p className="mt-1 text-sm text-graphite-600">{item.recipientCount} recipients · {item.sendPopup ? "Popup" : ""}{item.sendPopup && (item.sendEmail || item.sendWhatsApp) ? " + " : ""}{item.sendEmail ? "Email" : ""}{item.sendEmail && item.sendWhatsApp ? " + " : ""}{item.sendWhatsApp ? "WhatsApp" : ""}</p></div>)}</div></section>
  </div>;
}
