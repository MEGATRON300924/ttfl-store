import type { Metadata } from "next";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://ttfl-store-backend.onrender.com").replace(/\/$/, "");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await fetch(`${API_URL}/api/partner-events/events/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
    if (response.ok) {
      const data = await response.json();
      const event = data.event;
      if (event) {
        const title = `${event.title} | TTFL Store Events`;
        const description = String(event.description || `Join ${event.title} on TTFL Store.`).replace(/\s+/g, " ").slice(0, 160);
        const canonical = `https://ttflstore.name.ng/events/${encodeURIComponent(slug)}`;
        return { title, description, keywords: [event.title, "TTFL Store events", "virtual trade fair", "Nigeria"].filter(Boolean), alternates: { canonical }, openGraph: { title, description, url: canonical, type: "website", siteName: "TTFL Store" }, twitter: { card: "summary", title, description } };
      }
    }
  } catch {}
  return { title: "Event | TTFL Store", description: "View this TTFL Store partner event.", robots: { index: false, follow: false } };
}

export default function EventLayout({ children }: { children: React.ReactNode }) { return children; }
