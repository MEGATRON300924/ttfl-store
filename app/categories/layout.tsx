import type { Metadata } from "next";
export const metadata: Metadata = { title: "All Categories", description: "Browse all product categories available on TTFL Store.", openGraph: { title: "All Categories | TTFL Store", description: "Browse products by category on TTFL Store.", images: ["/ttflstore.png"] } };
export default function CategoriesLayout({ children }: { children: React.ReactNode }) { return children; }
