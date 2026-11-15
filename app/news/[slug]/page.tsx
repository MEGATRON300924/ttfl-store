import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { api } from "@/lib/api-client";

const SITE_URL = "https://ttflstore.name.ng";
type NewsArticle = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  coverImageUrl: string | null; coverImageAlt: string | null;
  seoTitle: string | null; seoDescription: string | null;
  publishedAt: string | null; updatedAt: string; createdAt: string;
};

async function getArticle(slug: string): Promise<NewsArticle | null> {
  try {
    const result = await api.get<{ article: NewsArticle }>(`/api/news/${encodeURIComponent(slug)}`);
    return result.article ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "News article not found", robots: { index: false, follow: false } };
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  const url = `${SITE_URL}/news/${article.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: { type: "article", siteName: "TTFL Store", title, description, url, publishedTime: article.publishedAt || article.createdAt, modifiedTime: article.updatedAt, images: article.coverImageUrl ? [{ url: article.coverImageUrl, alt: article.coverImageAlt || article.title }] : [{ url: "/ttflstore.png" }] },
    twitter: { card: "summary_large_image", title, description, images: article.coverImageUrl ? [article.coverImageUrl] : ["/ttflstore.png"] },
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "Africa/Lagos" }).format(new Date(value));
}

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article) notFound();
  const paragraphs = article.content.split(/\r?\n\s*\r?\n/).map((part) => part.trim()).filter(Boolean);
  const articleUrl = `${SITE_URL}/news/${article.slug}`;
  const publishedAt = article.publishedAt || article.createdAt;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    datePublished: publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    author: { "@type": "Organization", name: "The Tron Forge Limited", url: SITE_URL },
    publisher: { "@type": "Organization", name: "The Tron Forge Limited", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/ttflstore.png` } },
    isPartOf: { "@type": "NewsMediaOrganization", name: "TTFL Store News", url: `${SITE_URL}/news` },
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TTFL Store", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <article className="min-h-[70vh] bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData).replace(/</g, "\\u003c") }} />
      <div className="shell max-w-4xl py-8 sm:py-12">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-graphite-600 hover:text-graphite-950"><ArrowLeft className="h-4 w-4" /> All news</Link>
        <header className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ember-600">TTFL Store News</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-graphite-950 sm:text-5xl">{article.title}</h1>
          <p className="mt-5 text-base leading-7 text-graphite-600 sm:text-lg">{article.excerpt}</p>
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-graphite-500"><CalendarDays className="h-4 w-4" /> Published {formatDate(publishedAt)} · The Tron Forge Limited</p>
        </header>
        {article.coverImageUrl && <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-card bg-cloud-100"><Image src={article.coverImageUrl} alt={article.coverImageAlt || article.title} fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" /></div>}
        <div className="prose prose-graphite mt-9 max-w-none text-graphite-800">
          {paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-line text-base leading-8">{paragraph}</p>)}
        </div>
        <footer className="mt-12 border-t border-graphite-200 pt-6">
          <p className="text-sm font-semibold text-graphite-800">Published by The Tron Forge Limited</p>
          <Link href="/news" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-ember-600 hover:underline">More TTFL Store news <ArrowLeft className="h-4 w-4 rotate-180" /></Link>
        </footer>
      </div>
    </article>
  );
}
