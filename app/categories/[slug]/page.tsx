import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import type { ApiProduct } from "@/lib/api-types";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { SponsoredPlacementCard } from "@/components/sponsored-placement-card";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo-jsonld";

const SITE_URL = "https://ttflstore.name.ng";
type Category = { id: string; name: string; slug: string; children?: Category[] };
type SponsoredCampaign = { id: string; target_type: "STORE" | "PRODUCT" | "SERVICE" | "COMING_SOON"; storeName: string; storeSlug: string; storeLogoUrl: string | null; storeVerified: boolean; productSlug: string | null; productName: string | null; serviceSlug: string | null; serviceTitle: string | null };
function mapProduct(p: ApiProduct): Product { return { id: p.id, slug: p.slug, name: p.name, price: Number(p.price), previousPrice: p.previousPrice ? Number(p.previousPrice) : undefined, image: p.images?.[0]?.url ?? "", vendor: p.vendor.storeName, vendorSlug: p.vendor.storeSlug, verified: p.vendor.verified, location: p.location ?? p.vendor.location ?? "", rating: p.avgRating ? Number(p.avgRating) : 0, reviewCount: p.reviewCount, sellingMethod: p.sellingMethod === "EXTERNAL_LINK" ? "external" : p.sellingMethod === "WHATSAPP" ? "whatsapp" : "checkout" }; }
async function getCategory(slug: string) { const response = await api.get<{ categories: Category[] }>("/api/categories"); return response.categories.flatMap(c => [c, ...(c.children ?? [])]).find(c => c.slug === slug); }
async function getProducts(slug: string): Promise<ApiProduct[]> { const response = await api.get<{ items: ApiProduct[] }>(`/api/products?category=${encodeURIComponent(slug)}&limit=24&page=1&sort=newest`); return response.items ?? []; }
async function getSponsored(slug: string): Promise<SponsoredCampaign[]> { try { const response = await api.get<{ campaigns: SponsoredCampaign[] }>(`/api/ads/active?category=${encodeURIComponent(slug)}`); return response.campaigns ?? []; } catch { return []; } }

function getCategoryHeading(slug: string, categoryName: string) {
  // Use shopper language for this important search landing page, even if the
  // backend category label is shorter or internally named.
  if (slug === "computers") return "Laptops and Computers for Sale in Nigeria";
  return categoryName;
}

const CATEGORY_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  "phone-pouches-sleeves": {
    title: "Affordable Phone Pouches for Sale in Nigeria | TTFL Store",
    description: "Shop phone pouches and sleeves in Nigeria. Compare styles, sizes, materials and prices from sellers, including listings for shoppers in Abuja, Lagos and other cities.",
    keywords: ["cheap phone pouches for sale in Abuja", "phone pouches for sale in Nigeria", "phone pouch Abuja", "mobile phone sleeves Nigeria", "affordable phone pouch", "phone pouch online Nigeria"]
  },
  "phone-cases-covers": {
    title: "Phone Cases & Covers for Sale in Nigeria | TTFL Store",
    description: "Find affordable phone cases and covers in Nigeria for iPhone, Samsung, Tecno, Infinix and other devices. Compare designs and compatible models from local sellers.",
    keywords: ["phone cases Abuja", "cheap phone covers Nigeria", "phone cases for sale in Nigeria", "iPhone case Nigeria", "Samsung phone cover Abuja"]
  },
  "phone-chargers-power-adapters": {
    title: "Phone Chargers & Power Adapters for Sale in Nigeria | TTFL Store",
    description: "Compare phone chargers and power adapters in Nigeria, including USB-C, fast-charging and device-compatible options from sellers serving Abuja, Lagos and beyond.",
    keywords: ["phone charger for sale Abuja", "cheap phone chargers Nigeria", "USB-C charger Nigeria", "fast charger Abuja", "phone power adapter Nigeria"]
  },
  "charging-cables": {
    title: "Charging Cables for Sale in Nigeria | TTFL Store",
    description: "Shop USB-C, Lightning and other charging cables in Nigeria. Compare connector types, cable lengths and supported charging power from local sellers.",
    keywords: ["charging cables Abuja", "USB-C cable Nigeria", "iPhone charging cable Nigeria", "cheap charging cable for sale"]
  },
  "power-banks-chargers": {
    title: "Power Banks & Chargers for Sale in Nigeria | TTFL Store",
    description: "Compare power banks and chargers in Nigeria by capacity, charging speed, ports and compatibility. Explore listings from sellers across the country.",
    keywords: ["power banks Abuja", "cheap power bank Nigeria", "power bank for sale Nigeria", "fast charger Nigeria"]
  },
  "rings": {
    title: "Rings for Sale in Nigeria | TTFL Store",
    description: "Discover rings for sale in Nigeria, from fashion and statement rings to wedding bands. Compare ring sizes, materials, finishes and prices from local sellers.",
    keywords: ["rings for sale Abuja", "affordable rings Nigeria", "wedding bands Nigeria", "fashion rings Abuja", "ring sizes Nigeria"]
  },
  "jewellery": {
    title: "Jewellery for Sale in Nigeria | TTFL Store",
    description: "Shop jewellery in Nigeria, including rings, necklaces, bracelets and earrings. Compare styles, materials, sizes and prices from sellers across Nigeria.",
    keywords: ["jewellery for sale Abuja", "affordable jewellery Nigeria", "jewelry Nigeria", "rings and necklaces Abuja"]
  },
  "fashion-jewellery": {
    title: "Fashion Jewellery for Sale in Nigeria | TTFL Store",
    description: "Find fashion jewellery in Nigeria, including everyday accessories, statement pieces, rings, earrings and necklaces from local sellers.",
    keywords: ["fashion jewellery Abuja", "cheap fashion jewellery Nigeria", "fashion accessories for sale Nigeria"]
  },
  "mens-clothing": {
    title: "Men's Clothing for Sale in Nigeria | TTFL Store",
    description: "Shop men's clothing in Nigeria, including shirts, trousers, jeans, traditional outfits and everyday essentials. Compare sizes and prices from local sellers.",
    keywords: ["men's clothes Abuja", "affordable men's clothing Nigeria", "men's fashion for sale Nigeria"]
  },
  "womens-clothing": {
    title: "Women's Clothing for Sale in Nigeria | TTFL Store",
    description: "Discover women's clothing in Nigeria, including dresses, tops, skirts and traditional wear. Compare styles, sizes and prices from local sellers.",
    keywords: ["women's clothes Abuja", "affordable women's clothing Nigeria", "women's fashion for sale Nigeria"]
  },
  "shoes-footwear": {
    title: "Shoes & Footwear for Sale in Nigeria | TTFL Store",
    description: "Shop shoes and footwear in Nigeria, including sneakers, sandals, formal shoes and boots. Compare sizes, styles and prices from local sellers.",
    keywords: ["shoes for sale Abuja", "cheap shoes Nigeria", "sneakers Abuja", "footwear for sale in Nigeria"]
  },
  "computers-laptops": {
    title: "Laptops & Computers for Sale in Nigeria | TTFL Store",
    description: "Shop laptops, desktop computers, gaming PCs and computer accessories for sale in Nigeria. Compare listings and prices from sellers on TTFL Store.",
    keywords: ["laptops for sale in Nigeria", "computers for sale in Nigeria", "buy laptop Nigeria", "desktop computers Nigeria", "gaming PCs Nigeria", "computer accessories Nigeria"]
  }
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug).catch(() => undefined);
  if (!category) return { title: "Category not found", robots: { index: false, follow: true } };
  const heading = getCategoryHeading(params.slug, category.name);
  const isComputers = params.slug === "computers";
  const categorySeo = CATEGORY_SEO[params.slug];
  const title = categorySeo?.title ?? (isComputers
    ? "Laptops & Computers for Sale in Nigeria | TTFL Store"
    : `${heading} for Sale in Nigeria | TTFL Store`);
  const description = categorySeo?.description ?? (isComputers
    ? "Shop laptops, desktop computers, gaming PCs and computer accessories for sale in Nigeria. Compare listings and prices from sellers on TTFL Store."
    : `Shop ${heading.toLowerCase()} for sale in Nigeria. Compare products, specifications and prices from sellers across Nigeria, including options for shoppers in Abuja, Lagos, Port Harcourt and other cities.`);
  const keywords = categorySeo?.keywords ?? [
    heading,
    `${heading} for sale in Nigeria`,
    `buy ${heading.toLowerCase()} in Nigeria`,
    `${heading.toLowerCase()} Abuja`,
    `affordable ${heading.toLowerCase()} Nigeria`,
    `${heading.toLowerCase()} for sale Lagos`
  ];
  const canonical = `${SITE_URL}/categories/${params.slug}`;
  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "TTFL Store",
      title,
      description,
      url: canonical,
      images: [{ url: "/ttflstore.png", width: 1200, height: 630, alt: "TTFL Store" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/ttflstore.png"],
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, products, sponsored] = await Promise.all([
    getCategory(params.slug).catch(() => undefined),
    getProducts(params.slug).catch(() => []),
    getSponsored(params.slug),
  ]);
  if (!category) notFound();
  const heading = getCategoryHeading(params.slug, category.name);
  const mapped = products.map(mapProduct);
  const description = params.slug === "computers"
    ? "Browse laptops, desktop computers, gaming PCs and computer accessories listed by sellers across Nigeria. Compare available products and prices before you buy."
    : `Shop ${heading} from sellers across Nigeria on TTFL Store.`;
  return <main className="shell py-8 sm:py-12">
    <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Categories", url: "/categories" }, { name: heading, url: `/categories/${params.slug}` }]} />
    <ItemListJsonLd name={`${heading} for sale`} items={products.map(p => ({ name: p.name, url: `/products/${p.slug}`, image: p.images?.[0]?.url }))} />
    <nav className="text-xs text-graphite-500"><Link href="/">Home</Link> <span aria-hidden="true">/</span> <Link href="/categories">Categories</Link> <span aria-hidden="true">/</span> <span>{heading}</span></nav>
    <h1 className="mt-3 text-3xl font-bold capitalize text-graphite-950">{heading}</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-600">{description}</p>
    {sponsored.length > 0 && <section aria-label={`Sponsored ${heading} results`} className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-graphite-900">Sponsored in {heading}</h2><span className="text-[11px] font-semibold uppercase tracking-wide text-ember-600">Paid placement</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sponsored.slice(0, 6).map(c => <SponsoredPlacementCard key={c.id} campaign={c} />)}</div></section>}
    {mapped.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{mapped.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="mt-8 rounded-card border border-dashed border-graphite-300 p-10 text-center text-sm text-graphite-600">No products are available in this category yet.</div>}
  </main>;
}
