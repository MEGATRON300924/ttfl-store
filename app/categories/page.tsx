import type { Metadata } from "next";
import { SeoContentPage } from "@/components/seo-content-page";

export const metadata: Metadata = { title: "All Categories", description: "Browse all product categories available on TTFL Store.", openGraph: { title: "All Categories | TTFL Store", description: "Browse products by category on TTFL Store.", images: ["/icon.png"] } };

export default function CategoriesPage() { return <SeoContentPage eyebrow="Shop by category" title="All categories" description="Explore TTFL Store categories and find products from stores across Nigeria." sections={[{ title: "Discover products", body: "Choose a category to narrow your search and discover products from independent TTFL Store sellers." }, { title: "Trusted checkout", body: "Products sold through TTFL Store checkout use our secure Paystack payment flow." }]} actions={[{ href: "/search", label: "Search products" }, { href: "/", label: "Back to store" }]} />; }
