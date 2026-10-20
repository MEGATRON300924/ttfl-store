import { NextResponse } from "next/server";

export const revalidate = 3600;

const SITE_URL = "https://ttflstore.name.ng";
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://ttfl-store-backend-af5u.onrender.com"
    : "http://localhost:4000")
).replace(/\/$/, "");

type Product = {
  id: string;
  publicProductId?: string;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  currency?: string;
  condition?: "NEW" | "USED";
  stock: number;
  status: string;
  comingSoon?: boolean;
  sellingMethod?: string;
  specifications?: Record<string, unknown> | null;
  images?: Array<{ url: string; isPrimary?: boolean; position?: number }>;
  category?: { name?: string };
};

type ProductPage = {
  items: Product[];
  pagination: { totalPages: number };
};

function xml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plainText(value: unknown): string {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function productEntry(product: Product): string {
  const image = product.images?.find((item) => item.isPrimary)?.url
    ?? [...(product.images ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url;
  const price = Number(product.price);
  const currency = product.currency || "NGN";
  const availability = product.status === "OUT_OF_STOCK" || product.stock <= 0
    ? "out_of_stock"
    : "in_stock";
  const brand = plainText(product.specifications?.brand);
  const condition = product.condition === "USED" ? "used" : "new";
  const fields: Array<[string, string]> = [
    ["g:id", product.publicProductId || product.id],
    ["g:title", plainText(product.name).slice(0, 150)],
    ["g:description", plainText(product.description || product.name).slice(0, 5000)],
    ["g:link", `${SITE_URL}/products/${product.slug}`],
    ...(image ? [["g:image_link", image] as [string, string]] : []),
    ["g:availability", availability],
    ["g:price", `${Number.isFinite(price) ? price.toFixed(2) : "0.00"} ${currency}`],
    ["g:condition", condition],
    ...(brand ? [["g:brand", brand] as [string, string]] : []),
    ...(product.category?.name ? [["g:product_type", plainText(product.category.name)] as [string, string]] : []),
  ];
  return `    <item>\n${fields.map(([key, value]) => `      <${key}>${xml(value)}</${key}>`).join("\n")}\n    </item>`;
}

export async function GET() {
  try {
    const products: Product[] = [];
    let totalPages = 1;

    for (let page = 1; page <= Math.min(totalPages, 100); page++) {
      const response = await fetch(
        `${API_URL}/api/products?limit=48&page=${page}&sort=newest`,
        { next: { revalidate: 3600 } }
      );
      if (!response.ok) {
        throw new Error(`Product API returned HTTP ${response.status}`);
      }
      const data = (await response.json()) as ProductPage;
      if (!Array.isArray(data.items) || !data.pagination) {
        throw new Error("Unexpected product API response");
      }
      products.push(...data.items);
      totalPages = Math.max(1, Number(data.pagination.totalPages) || 1);
    }

    const eligible = products.filter((product) =>
      product.status === "ACTIVE" &&
      !product.comingSoon &&
      Boolean(product.slug) &&
      Boolean(product.name) &&
      Number.isFinite(Number(product.price)) &&
      Number(product.price) >= 0
    );

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>TTFL Store Products</title>\n    <link>${SITE_URL}</link>\n    <description>Live product catalogue from TTFL Store</description>\n${eligible.map(productEntry).join("\n")}\n  </channel>\n</rss>\n`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Google Merchant product feed failed", error);
    return new NextResponse("Product feed is temporarily unavailable. Please retry later.\n", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
