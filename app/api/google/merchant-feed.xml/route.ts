import { NextResponse } from "next/server";
import { getGoogleBrand, getGoogleGtin, getGoogleMpn, getGoogleProductCategory, getGoogleVariantSpec } from "@/lib/google-product-data";

const SITE_URL = "https://ttflstore.name.ng";
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

type ProductImage = { url: string; isPrimary?: boolean; position?: number };
type Product = {
  id: string; publicProductId?: string; name: string; slug: string; description: string;
  price: string; currency: string; condition: "NEW" | "USED"; stock: number;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "OUT_OF_STOCK"; comingSoon?: boolean;
  sellingMethod: "CHECKOUT" | "EXTERNAL_LINK" | "WHATSAPP";
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
function primaryImage(product: Product): string | undefined {
  return [...product.images].sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)) || (a.position ?? 0) - (b.position ?? 0))[0]?.url;
}
function parseVariations(product: Product): Array<{ key: string; label: string; options: Record<string, string>; price?: string; imageUrl?: string }> {
  const raw = product.specifications?._variations;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.options === "object" && item.options).map((item) => ({
      key: String(item.key ?? ""), label: String(item.label ?? ""), options: item.options as Record<string, string>,
      price: item.price ? String(item.price) : undefined, imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
    }));
  } catch { return []; }
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
    const eligible = products.filter((product) =>
      product.status !== "SUSPENDED" && product.status !== "DRAFT" && !product.comingSoon &&
      product.sellingMethod === "CHECKOUT" && Number(product.price) > 0 && Boolean(primaryImage(product)) &&
      Boolean(product.slug) && Boolean(product.name) && Boolean(product.description) && Boolean(product.currency)
    );

    const items = eligible.flatMap((product) => {
      const image = primaryImage(product)!;
      const productUrl = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;
      const itemGroupId = product.publicProductId || product.id;
      const brand = getGoogleBrand(product);
      const category = getGoogleProductCategory(product as any);
      const variations = parseVariations(product);
      const variants = variations.length ? variations : [{ key: "", label: "", options: {}, price: undefined, imageUrl: undefined }];

      return variants.map((variation) => {
        const color = getGoogleVariantSpec(variation, product, "color");
        const size = getGoogleVariantSpec(variation, product, "size");
        const material = getGoogleVariantSpec(variation, product, "material");
        const gender = getGoogleVariantSpec(variation, product, "gender");
        const ageGroup = getGoogleVariantSpec(variation, product, "age_group");
        const pattern = getGoogleVariantSpec(variation, product, "pattern");
        const variantGtin = getGoogleVariantSpec(variation, product, "gtin");
        const variantMpn = getGoogleVariantSpec(variation, product, "mpn");
        const variantId = variation.key ? `${itemGroupId}-${variation.key}` : itemGroupId;
        const variantUrl = variation.key ? `${productUrl}?variant=${encodeURIComponent(variation.key)}` : productUrl;
        const variantOptions = Object.entries(variation.options).filter(([name, value]) => String(name).trim() && String(value).trim()).map(([name, value]) => ({ name: String(name).trim(), value: String(value).trim() }));
        const variantTitle = variation.label && variation.label !== product.name ? `${product.name} - ${variation.label}` : product.name;
        const price = variation.price && Number(variation.price) > 0 ? variation.price : product.price;
        return `
    <item>
      <g:id>${xml(variantId)}</g:id>
      <g:item_group_id>${xml(itemGroupId)}</g:item_group_id>
      <g:item_group_title>${xml(text(product.name, 150))}</g:item_group_title>
      <g:title>${xml(text(variantTitle, 150))}</g:title>
      <g:description>${xml(text(product.description))}</g:description>
      <link>${xml(variantUrl)}</link>
      <g:image_link>${xml(variation.imageUrl || image)}</g:image_link>
      <g:availability>${product.stock > 0 && product.status === "ACTIVE" ? "in_stock" : "out_of_stock"}</g:availability>
      <g:condition>${product.condition === "USED" ? "used" : "new"}</g:condition>
      <g:price>${xml(`${price} ${product.currency}`)}</g:price>
      <g:canonical_link>${xml(productUrl)}</g:canonical_link>
      <g:product_type>${xml(product.category.name)}</g:product_type>${category ? `\n      <g:google_product_category>${xml(category)}</g:google_product_category>` : ""}
      <g:identifier_exists>${variantGtin || (brand && variantMpn) ? "yes" : "no"}</g:identifier_exists>${brand ? `\n      <g:brand>${xml(text(brand, 70))}</g:brand>` : ""}${variantGtin ? `\n      <g:gtin>${xml(text(variantGtin, 70))}</g:gtin>` : ""}${variantMpn ? `\n      <g:mpn>${xml(text(variantMpn, 70))}</g:mpn>` : ""}${variantOptions.map((option) => `\n      <g:variant_option><g:name>${xml(text(option.name, 250))}</g:name><g:value>${xml(text(option.value, 250))}</g:value></g:variant_option>`).join("")}${color ? `\n      <g:color>${xml(text(color, 100))}</g:color>` : ""}${size ? `\n      <g:size>${xml(text(size, 100))}</g:size>` : ""}${material ? `\n      <g:material>${xml(text(material, 100))}</g:material>` : ""}${gender ? `\n      <g:gender>${xml(text(gender, 50))}</g:gender>` : ""}${ageGroup ? `\n      <g:age_group>${xml(text(ageGroup, 50))}</g:age_group>` : ""}${pattern ? `\n      <g:pattern>${xml(text(pattern, 100))}</g:pattern>` : ""}
      <g:custom_label_0>${xml(text((product.tags ?? []).filter(Boolean).join(", "), 100))}</g:custom_label_0>
      <g:custom_label_1>${xml(product.vendor.storeName)}</g:custom_label_1>
      <g:custom_label_2>${xml(product.vendor.storeSlug)}</g:custom_label_2>
    </item>`;
      });
    }).join("");

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel><title>TTFL Store</title><link>${SITE_URL}</link><description>Products available on TTFL Store</description>${items}
  </channel>
</rss>`;
    return new NextResponse(feed, { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    console.error("Google Merchant feed generation failed", error);
    return new NextResponse("Merchant feed temporarily unavailable", { status: 503 });
  }
}