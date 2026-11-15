import { api } from "@/lib/api-client";

const SITE_URL = "https://ttflstore.name.ng";
type Article = { title: string; slug: string; excerpt: string; content: string; publishedAt: string | null; updatedAt: string };

function xml(value: string) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  let articles: Article[] = [];
  try {
    const result = await api.get<{ articles: Article[] }>("/api/news?limit=50");
    articles = result.articles ?? [];
  } catch {
    // Keep the feed valid and empty during a temporary API outage.
  }
  const items = articles.map((article) => {
    const url = `${SITE_URL}/news/${article.slug}`;
    const date = article.publishedAt ? new Date(article.publishedAt).toUTCString() : new Date(article.updatedAt).toUTCString();
    return `<item><title>${xml(article.title)}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid><description>${xml(article.excerpt)}</description><pubDate>${xml(date)}</pubDate></item>`;
  }).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>TTFL Store News</title><link>${SITE_URL}/news</link><description>Official news and announcements from TTFL Store and The Tron Forge Limited.</description><language>en-ng</language>${items}</channel></rss>`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
