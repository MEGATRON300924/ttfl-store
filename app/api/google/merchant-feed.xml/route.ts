import { NextResponse } from "next/server";

const SITE_URL = "https://ttflstore.name.ng";
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

type ProductImage = { url: string; isPrimary?: boolean; position?: number };
type Product = {
  id: string; publicProductId?: string; name: string; slug: string; description: string;
  price: string; currency: string; condition: "NEW" | "USED";
  stock: number; status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "OUT_OF_STOCK";
  comingSoon?: boolean; sellingMethod: "CHECKOUT" | "EXTERNAL_LINK" | "WHATSAPP";
  specifications?: Record<string, string> | null; tags?: string[]; images: ProductImage[];
  category: { name: string; slug: string };
  vendor: { storeName: string; storeSlug: string; verified: boolean; location: string | null };
};
type SearchResponse = { items: Product[]; pagination: { totalPages: number } };

function xml(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function text(value: string | undefined | null, max = 5000): string {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
function spec(product: Product, ...keys: string[]): string | undefined {
  const entries = Object.entries(product.specifications ?? {});
  for (const key of keys) {
    const found = entries.find(([name]) => name.trim().toLowerCase() === key.toLowerCase());
    if (found?.[1]) return String(found[1]).trim();
  }
  return undefined;
}
function primaryImage(product: Product): string | undefined {
  return [...product.images].sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)) || (a.position ?? 0) - (b.position ?? 0))[0]?.url;
}
async function getAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  for (let page = 1; page <= 100; page += 1) {
    const response = await fetch(`${API_URL}/api/products?limit=48&page=${page}&sort=newest`, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`Product API returned ${response.status}`);
    const data = (await response.json()) as SearchResponse;
    all.push(...data.items);
    if (page >= data.pagination.totalPages) break;
  }
  return all;
}

export async function GET() {
  try {
    const products = await getAllProducts();
    const eligible = products.filter((product) => product.status !== "SUSPENDED" && product.status !== "DRAFT" && !product.comingSoon && product.sellingMethod === "CHECKOUT" && Number(product.price) > 0 && Boolean(primaryImage(product)) && Boolean(product.slug) && Boolean(product.name) && Boolean(product.description) && Boolean(product.currency));
    const items = eligible.map((product) => {
      const image = primaryImage(product)!;
      const productUrl = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;
      const brand = spec(product, "brand", "manufacturer");
      const gtin = spec(product, "gtin", "ean", "upc", "isbn");
      const mpn = spec(product, "mpn", "manufacturer part number", "part number");
      const availability = product.stock > 0 && product.status === "ACTIVE" ? "in_stock" : "out_of_stock";
      const condition = product.condition === "USED" ? "used" : "new";
      const tags = (product.tags ?? []).filter(Boolean).join(", ");
      return `
    <item>
      <g:id>${xml(product.publicProductId || product.id)}</g:id>
      <g:title>${xml(text(product.name, 150))}</g:title>
      <g:description>${xml(text(product.description))}</g:description>
      <link>${xml(productUrl)}</link>
      <g:image_link>${xml(image)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:price>${xml(`${product.price} ${product.currency}`)}</g:price>
      <g:canonical_link>${xml(productUrl)}</g:canonical_link>
      <g:product_type>${xml(product.category.name)}</g:product_type>
      <g:identifier_exists>${gtin || mpn ? "yes" : "no"}</g:identifier_exists>${brand ? `\n      <g:brand>${xml(text(brand, 70))}</g:brand>` : ""}${gtin ? `\n      <g:gtin>${xml(text(gtin, 70))}</g:gtin>` : ""}${mpn ? `\n      <g:mpn>${xml(text(mpn, 70))}</g:mpn>` : ""}${tags ? `\n      <g:custom_label_0>${xml(text(tags, 100))}</g:custom_label_0>` : ""}
      <g:custom_label_1>${xml(product.vendor.storeName)}</g:custom_label_1>
      <g:custom_label_2>${xml(product.vendor.storeSlug)}</g:custom_label_2>
    </item>`;
    }).join("");
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>TTFL Store</title>
    <link>${SITE_URL}</link>
    <description>Products available on TTFL Store</description>${items}
  </channel>
</rss>`;
    return new NextResponse(feed, { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    console.error("Google Merchant feed generation failed", error);
    return new NextResponse("Merchant feed temporarily unavailable", { status: 503 });
  }
}
