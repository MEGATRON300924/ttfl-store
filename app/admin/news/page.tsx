"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Newspaper, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type NewsArticle = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  coverImageUrl: string | null; coverImageAlt: string | null;
  seoTitle: string | null; seoDescription: string | null;
  status: "DRAFT" | "PUBLISHED"; publishedAt: string | null; updatedAt: string;
};
type FormState = { title: string; slug: string; excerpt: string; content: string; coverImageUrl: string; coverImageAlt: string; seoTitle: string; seoDescription: string; status: "DRAFT" | "PUBLISHED" };
const EMPTY: FormState = { title: "", slug: "", excerpt: "", content: "", coverImageUrl: "", coverImageAlt: "", seoTitle: "", seoDescription: "", status: "DRAFT" };

export default function AdminNewsPage() {
  const { user, loading, refresh } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (user?.role === "ADMIN") void loadArticles(); }, [user]);

  async function loadArticles() {
    try { const result = await api.get<{ articles: NewsArticle[] }>("/api/news/admin/articles"); setArticles(result.articles ?? []); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Could not load news articles."); }
  }

  function edit(article: NewsArticle) {
    setEditingId(article.id);
    setForm({ title: article.title, slug: article.slug, excerpt: article.excerpt, content: article.content, coverImageUrl: article.coverImageUrl || "", coverImageAlt: article.coverImageAlt || "", seoTitle: article.seoTitle || "", seoDescription: article.seoDescription || "", status: article.status });
    setError(""); setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset(clearMessage = true) { setEditingId(null); setForm(EMPTY); setError(""); if (clearMessage) setMessage(""); }

  async function uploadCover(file?: File) {
    if (!file) return;
    setUploading(true); setError(""); setMessage("");
    try {
      const body = new FormData(); body.append("image", file);
      const result = await api.post<{ url: string }>("/api/uploads/news-image", body);
      setForm((current) => ({ ...current, coverImageUrl: result.url }));
      setMessage("Cover image uploaded.");
    } catch (err) { setError(err instanceof ApiError ? err.message : "Image upload failed."); }
    finally { setUploading(false); }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (editingId) await api.patch(`/api/news/admin/articles/${editingId}`, form);
      else await api.post("/api/news/admin/articles", form);
      await loadArticles();
      reset(false);
      setMessage(form.status === "PUBLISHED" ? "Article published successfully." : "Draft saved.");
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not save this article."); }
    finally { setBusy(false); }
  }

  async function remove(article: NewsArticle) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setError(""); setMessage("");
    try { await api.delete(`/api/news/admin/articles/${article.id}`); setArticles((current) => current.filter((item) => item.id !== article.id)); if (editingId === article.id) reset(); setMessage("Article deleted."); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Could not delete this article."); }
  }

  if (loading) return <div className="shell py-16 text-sm text-graphite-500">Loading admin access…</div>;
  if (user?.role !== "ADMIN") return <div className="shell py-16"><h1 className="text-2xl font-bold text-graphite-950">Administrator access required</h1><p className="mt-2 text-sm text-graphite-600">Sign in with an authorised TTFL Store administrator account to manage news.</p></div>;

  return (
    <div className="shell max-w-6xl py-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-ember-600">Publishing</p><h1 className="mt-2 text-3xl font-extrabold text-graphite-950">News articles</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">Publish official announcements, campaign dates and marketplace updates. Published articles are visible publicly and included in search discovery.</p></div>
        <a href="/news" target="_blank" rel="noreferrer" className="text-sm font-semibold text-graphite-700 underline">View public News page</a>
      </div>

      {(error || message) && <div role="status" className={`mt-6 rounded-card px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || message}</div>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
        <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-graphite-950">{editingId ? "Edit article" : "Write an article"}</h2>{editingId && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-semibold text-graphite-500"><X className="h-4 w-4" /> Cancel edit</button>}</div>
          <form onSubmit={save} className="mt-5 space-y-4">
            <label className="block"><span className="text-sm font-semibold text-graphite-800">Headline</span><input required minLength={3} maxLength={180} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 w-full rounded-card border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-500" placeholder="e.g. TTFL Store Black Friday 2026 dates announced" /></label>
            <label className="block"><span className="text-sm font-semibold text-graphite-800">URL slug <span className="font-normal text-graphite-400">(optional; generated from headline if blank)</span></span><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1.5 w-full rounded-card border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-500" placeholder="ttfl-store-black-friday-2026" /></label>
            <label className="block"><span className="text-sm font-semibold text-graphite-800">Short summary</span><textarea required minLength={10} maxLength={400} rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="mt-1.5 w-full rounded-card border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-500" placeholder="A concise summary shown in search results and article listings." /></label>
            <label className="block"><span className="text-sm font-semibold text-graphite-800">Article content</span><textarea required minLength={30} rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1.5 w-full rounded-card border border-graphite-200 px-3 py-3 text-sm leading-7 outline-none focus:border-ember-500" placeholder={"Write the full announcement here. Separate paragraphs with a blank line. Include exact dates, times, eligibility and conditions where relevant."} /></label>
            <div className="rounded-card border border-graphite-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-semibold text-graphite-800">Cover image</span><label className="inline-flex cursor-pointer items-center gap-2 rounded-card border border-graphite-200 px-3 py-2 text-xs font-semibold text-graphite-700 hover:bg-cloud-50"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={uploading} onChange={(e) => { void uploadCover(e.target.files?.[0]); e.currentTarget.value = ""; }} />{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload image</label></div>
              {form.coverImageUrl ? <div className="mt-3"><div className="relative aspect-[16/9] overflow-hidden rounded-card bg-cloud-100"><Image src={form.coverImageUrl} alt={form.coverImageAlt || "News cover preview"} fill sizes="600px" className="object-cover" /></div><button type="button" onClick={() => setForm({ ...form, coverImageUrl: "" })} className="mt-2 text-xs font-semibold text-red-600">Remove cover image</button></div> : <div className="mt-3 flex items-center gap-2 text-xs text-graphite-500"><ImagePlus className="h-5 w-5" /> JPEG, PNG, WebP or AVIF · maximum 5 MB</div>}
              <label className="mt-3 block"><span className="text-xs font-semibold text-graphite-700">Image description (alt text)</span><input value={form.coverImageAlt} onChange={(e) => setForm({ ...form, coverImageAlt: e.target.value })} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2 text-sm" placeholder="Describe what the cover image shows" /></label>
            </div>
            <details className="rounded-card border border-graphite-200 p-4"><summary className="cursor-pointer text-sm font-semibold text-graphite-800">Search and social preview settings</summary><div className="mt-4 space-y-3"><label className="block"><span className="text-xs font-semibold text-graphite-700">SEO title (up to 70 characters)</span><input maxLength={70} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2 text-sm" placeholder="Uses the headline when blank" /></label><label className="block"><span className="text-xs font-semibold text-graphite-700">SEO description (up to 180 characters)</span><textarea maxLength={180} rows={2} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className="mt-1 w-full rounded-card border border-graphite-200 px-3 py-2 text-sm" placeholder="Uses the summary when blank" /></label></div></details>
            <label className="block"><span className="text-sm font-semibold text-graphite-800">Publishing status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "DRAFT" | "PUBLISHED" })} className="mt-1.5 w-full rounded-card border border-graphite-200 px-3 py-2.5 text-sm"><option value="DRAFT">Save as draft</option><option value="PUBLISHED">Publish now</option></select></label>
            <button disabled={busy || uploading} className="inline-flex w-full items-center justify-center gap-2 rounded-card bg-graphite-950 px-4 py-3 text-sm font-bold text-white hover:bg-graphite-800 disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{busy ? "Saving…" : form.status === "PUBLISHED" ? "Publish article" : "Save draft"}</button>
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-graphite-950">All articles</h2><button onClick={() => { reset(); }} className="inline-flex items-center gap-1 rounded-card border border-graphite-200 px-3 py-2 text-xs font-semibold text-graphite-700"><Plus className="h-4 w-4" /> New</button></div>
          <div className="mt-4 space-y-3">
            {articles.length === 0 ? <div className="rounded-card border border-dashed border-graphite-300 bg-white p-8 text-center"><Newspaper className="mx-auto h-7 w-7 text-graphite-400" /><p className="mt-3 text-sm text-graphite-500">No articles have been created yet.</p></div> : articles.map((article) => <div key={article.id} className="rounded-card border border-graphite-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${article.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-cloud-100 text-graphite-600"}`}>{article.status}</span><h3 className="mt-2 line-clamp-2 text-sm font-bold text-graphite-900">{article.title}</h3><p className="mt-1 break-all text-[11px] text-graphite-400">/news/{article.slug}</p><p className="mt-2 text-xs text-graphite-500">Updated {new Date(article.updatedAt).toLocaleDateString("en-NG")}</p></div>{article.coverImageUrl && <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-cloud-100"><Image src={article.coverImageUrl} alt="" fill sizes="96px" className="object-cover" /></div>}</div><div className="mt-3 flex items-center gap-2 border-t border-graphite-100 pt-3"><button onClick={() => edit(article)} className="inline-flex items-center gap-1 text-xs font-semibold text-graphite-700 hover:text-ember-600"><Pencil className="h-3.5 w-3.5" /> Edit</button>{article.status === "PUBLISHED" && <a href={`/news/${article.slug}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-graphite-600 underline">View</a>}<button onClick={() => void remove(article)} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button></div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
