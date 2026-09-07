import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = { title: "Featured Stores", description: "Discover stores featured by TTFL Store and explore their products.", openGraph: { title: "Featured Stores | TTFL Store", description: "Explore featured sellers and stores on TTFL Store.", images: ["/icon.png"] } };

export default function FeaturedStoresPage() { return <SeoContentPage eyebrow="Featured stores" title="Stores worth discovering" description="Explore stores selected and promoted on TTFL Store. Featured placement helps shoppers discover sellers and their products." sections={[{ title: "Featured placement", body: "Stores can promote their storefront through TTFL Store's featured system." }, { title: "Shop with confidence", body: "Store verification, seller information, order tracking and secure checkout help make shopping clearer and safer." }]} actions={[{ href: "/", label: "Shop now" }, { href: "/support", label: "Need help?" }]} />; }
