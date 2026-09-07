import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = { title: "Deals", description: "Discover deals and limited-time offers from stores on TTFL Store.", openGraph: { title: "Deals | TTFL Store", description: "Discover deals and limited-time offers from TTFL Store sellers.", images: ["/icon.png"] } };

export default function DealsPage() { return <SeoContentPage eyebrow="TTFL Store Deals" title="Deals and limited-time offers" description="Find great prices from independent stores on TTFL Store. Flash deals and featured offers will appear here as sellers publish them." sections={[{ title: "Flash deals", body: "Limited-time seller promotions are designed to help shoppers discover products at special prices." }, { title: "Shop safely", body: "Every checkout payment is processed through Paystack and eligible orders can be tracked from confirmation through delivery." }]} actions={[{ href: "/categories", label: "Browse categories" }, { href: "/", label: "Shop products" }]} />; }
