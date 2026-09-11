import type { Metadata } from "next";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://ttfl-store-backend.onrender.com").replace(/\/$/, "");

async function getService(slug: string) {
  try {
    const response = await fetch(`${API_URL}/api/services/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
    if (!response.ok) return null;
    const data = await response.json();
    return data.service ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service | TTFL Store", robots: { index: false, follow: false } };
  const title = `${service.title} | ${service.storeName || "TTFL Store"}`;
  const description = String(service.description || `Book ${service.title} on TTFL Store.`).replace(/\s+/g, " ").slice(0, 160);
  const canonical = `https://ttflstore.name.ng/services/${encodeURIComponent(service.slug || slug)}`;
  return {
    title,
    description,
    keywords: [service.title, service.storeName, service.category, "TTFL Services", "services in Nigeria"].filter(Boolean),
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", siteName: "TTFL Store" },
    twitter: { card: "summary", title, description },
  };
}

export default function ServiceLayout({ children }: { children: React.ReactNode }) { return children; }
