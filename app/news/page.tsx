import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper, Rss } from "lucide-react";
import { api } from "@/lib/api-client";

export const revalidate = 300;
const SITE_URL = "https://ttflstore.name.ng";

type NewsArticle = {
  id: string; title: string; slug: string; excerpt: string;
  coverImageUrl: string | null; coverImageAlt: string | null;
  publishedAt: string | null; updatedAt: string;
};

export const metadata: Metadata = {
  title: "TTFL Store News and Updates",
  description: "Official TTFL Store news, marketplace announcements, campaign dates, shopping events and company updates from The Tron Forge Limited.",
  alternates: { canonical: `${SITE_URL}/news` },
  keywords: ["TTFL Store news", "TTFL Store updates", "TTFL Store Black Friday", "The Tron Forge Limited announcements"],
  openGraph: { type: "website", siteName: "TTFL Store", title: "TTFL Store News and Updates", description: "Official marketplace announcements, campaign dates and updates.", url: `${SITE_URL}/news` },
};

async function getArticles(): Promise<NewsArticle[]> {
  try {
    const result = await api.get<{ articles: NewsArticle[] }>("/api/news?limit=50");
    return result.articles ?? [];
  } catch {
    return [];
  }
}

function formatDate(value: string | null) {
  if (!value) return "Recently published";
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(value));
}

export default async function NewsPage() {
  const articles = await getArticles();
  return (
    <div className="min-h-[70vh] bg-cloud-50">
      <section className="border-b border-graphite-200 bg-white">
        <div className="shell py-12 sm:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-600">The official newsroom</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-graphite-950 sm:text-5xl">News from TTFL Store</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-graphite-600 sm:text-base">Official announcements, shopping campaign dates, marketplace updates and important information from The Tron Forge Limited.</p>
            </div>
            <Link href="/news/rss.xml" className="inline-flex items-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-700 hover:border-graphite-400"><Rss className="h-4 w-4" /> RSS feed</Link>
          </div>
        </div>
      </section>
      <section className="shell py-10 sm:py-14">
        {articles.length === 0 ? (
          <div className="rounded-card border border-dashed border-graphite-300 bg-white px-6 py-16 text-center">
            <Newspaper className="mx-auto h-8 w-8 text-graphite-400" />
            <h2 className="mt-4 text-lg font-bold text-graphite-900">No news articles yet</h2>
            <p className="mt-2 text-sm text-graphite-500">Official TTFL Store announcements will appear here when published.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-card border border-graphite-200 bg-white transition-shadow hover:shadow-md">
                <Link href={`/news/${article.slug}`} className="block">
                  <div className="relative aspect-[16/9] bg-cloud-100">
                    {article.coverImageUrl ? <Image src={article.coverImageUrl} alt={article.coverImageAlt || article.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" /> : <div className="flex h-full items-center justify-center"><Newspaper className="h-10 w-10 text-graphite-300" /></div>}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold text-ember-600">{formatDate(article.publishedAt)}</p>
                    <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-graphite-950">{article.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-graphite-600">{article.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-graphite-900">Read article <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
