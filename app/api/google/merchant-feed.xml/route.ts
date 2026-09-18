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
function canonicalAttribute(value: string): string {\n  const key = normalize(value);\n  if (/^(color|colour)$/.test(key)) return "color";\n  if (/^(size|sizes)$/.test(key)) return "size";\n  if (/^(material|materials|fabric)$/.test(key)) return "material";\n  if (/^(gender|sex)$/.test(key)) return "gender";\n  if (/^(age group|agegroup|age)$/.test(key)) return "age_group";\n  if (/^(pattern|design)$/.test(key)) return "pattern";\n  if (/^(brand|manufacturer|make)$/.test(key)) return "brand";\n  if (/^(gtin|ean|upc|isbn|barcode)$/.test(key)) return "gtin";\n  if (/^(mpn|manufacturer part number|part number|model number)$/.test(key)) return "mpn";\n  return key;\n}\nfunction spec(product: Product, ...keys: string[]): string | undefined {
  const entries = Object.entries(product.specifications ?? {});
  for (const key of keys) {
    const found = entries.find(([name]) => canonicalAttribute(name) === canonicalAttribute(key));
    if (found?.[1]) return String(found[1]).trim();
  }
  return undefined;
}
function primaryImage(product: Product): string | undefined {
  return [...product.images].sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)) || (a.position ?? 0) - (b.position ?? 0))[0]?.url;
}
function normalize(value?: string): string {
  return String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}
function specOrVariation(product: Product, variation: { options?: Record<string, string> } | null, ...keys: string[]): string | undefined {
  const options = variation?.options ?? {};
  for (const key of keys) {
    const wanted = normalize(key);
    const found = Object.entries(options).find(([name]) => normalize(name) === wanted);
    if (found?.[1]) return String(found[1]).trim();
  }
  return spec(product, ...keys);
}
function googleProductCategory(product: Product): string | undefined {
  const category = normalize(product.category.slug || product.category.name);
  const name = normalize(product.name);
  const specs = Object.entries(product.specifications ?? {})
    .filter(([key]) => !key.startsWith("_"))
    .map(([key, value]) => normalize(key) + " " + normalize(value))
    .join(" ");
  const haystack = [category, name, specs].join(" ");

  // Specific product types first; broader categories come last.
  if (/laptop|notebook|macbook|chromebook/.test(haystack)) return "Electronics > Computers > Laptops";
  if (/desktop|desktop computer|all in one|all-in-one|tower pc|gaming pc/.test(haystack)) return "Electronics > Computers > Desktop Computers";
  if (/computer monitor|gaming monitor|monitor|display/.test(haystack)) return "Electronics > Computers > Computer Monitors";
  if (/keyboard|mouse|webcam|computer accessory|computer accessories/.test(haystack)) return "Electronics > Computers > Computer Accessories";
  if (/iphone|smartphone|mobile phone|cell phone|android phone|feature phone/.test(haystack)) return "Electronics > Communications > Telephony > Mobile Phones";
  if (/tablet|ipad|ipad pro|ipad air/.test(haystack)) return "Electronics > Computers > Tablet Computers";
  if (/headphone|headphones|earbud|earbuds|earphone|earphones|speaker|soundbar|microphone|audio/.test(haystack)) return "Electronics > Audio";
  if (/camera|camcorder|digital camera|photography|lens/.test(haystack)) return "Cameras & Optics";
  if (/playstation|xbox|nintendo|gaming console|video game console/.test(haystack)) return "Electronics > Video Game Consoles";
  if (/video game|gaming game|game disc|game cartridge/.test(haystack)) return "Media > Video Game Software";
  if (/television|smart tv|smart television|\btv\b|oled tv|qled tv/.test(haystack)) return "Electronics > Video > Televisions";
  if (/smartwatch|smart watch|fitness tracker|wearable/.test(haystack)) return "Apparel & Accessories > Jewelry > Watches";

  if (/running shoe|running shoes|sneaker|sneakers|trainer|trainers|football boot|soccer cleat|basketball shoe/.test(haystack)) return "Apparel & Accessories > Shoes";
  if (/shoe|shoes|footwear|boots|sandals|slippers|heels/.test(haystack)) return "Apparel & Accessories > Shoes";
  if (/t-shirt|tshirt|shirt|blouse|top|hoodie|sweatshirt|jacket|coat|dress|skirt|trouser|pants|jeans|shorts|clothing|apparel/.test(haystack)) return "Apparel & Accessories > Clothing";
  if (/handbag|purse|backpack|wallet|luggage|suitcase|bag/.test(haystack)) return "Apparel & Accessories > Handbags, Wallets & Cases";
  if (/jewelry|jewellery|necklace|bracelet|earring|ring/.test(haystack)) return "Apparel & Accessories > Jewelry";
  if (/watch|wristwatch/.test(haystack)) return "Apparel & Accessories > Jewelry > Watches";

  if (/makeup|cosmetic|skincare|skin care|foundation|lipstick|mascara|perfume|fragrance|beauty/.test(haystack)) return "Health & Beauty";
  if (/shampoo|conditioner|hair care|haircare|wig|hair extension/.test(haystack)) return "Health & Beauty > Personal Care > Hair Care";

  if (/sofa|couch|bed|mattress|wardrobe|cabinet|table|chair|desk|furniture/.test(haystack)) return "Home & Garden > Furniture";
  if (/kitchen|cookware|pot|pan|blender|kettle|air fryer|utensil/.test(haystack)) return "Home & Garden > Kitchen & Dining";
  if (/garden|outdoor|lawn|plant pot|gardening/.test(haystack)) return "Home & Garden > Lawn & Garden";

  if (/running|football|soccer|basketball|tennis|gym|fitness|sports|sporting/.test(haystack)) return "Sporting Goods";

  if (/car part|auto part|automotive part|motorcycle part|vehicle part|tyre|tire|wheel|engine part/.test(haystack)) return "Vehicles & Parts";
  if (/car|automobile|motorcycle|vehicle/.test(haystack)) return "Vehicles & Parts";
  if (/bicycle|bike|cycling/.test(haystack)) return "Sporting Goods > Outdoor Recreation > Cycling";

  if (/toy|toys|doll|action figure|puzzle|board game/.test(haystack)) return "Toys & Games";
  if (/book|novel|textbook|comic|magazine/.test(haystack)) return "Media > Books";
  if (/office|stationery|notebook paper|printer|school supplies/.test(haystack)) return "Office Supplies";

  return undefined;
}
function parseVariations(product: Product): Array<{ key: string; label: string; options: Record<string, string>; price?: string; imageUrl?: string }> {
  const raw = product.specifications?._variations;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.options === "object" && item.options).map((item) => ({
      key: String(item.key ?? ""),
      label: String(item.label ?? ""),
      options: item.options as Record<string, string>,
      price: item.price ? String(item.price) : undefined,
      imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
    }));
  } catch {
    return [];
  }
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
    const items = eligible.flatMap((product) => {
      const image = primaryImage(product)!;
      const productUrl = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;
      const itemGroupId = product.publicProductId || product.id;
      const brand = spec(product, "brand", "manufacturer");
      const gtin = spec(product, "gtin", "ean", "upc", "isbn");
      const mpn = spec(product, "mpn", "manufacturer part number", "part number");
      const category = googleProductCategory(product);
      const availability = product.stock > 0 && product.status === "ACTIVE" ? "in_stock" : "out_of_stock";
      const condition = product.condition === "USED" ? "used" : "new";
      const tags = (product.tags ?? []).filter(Boolean).join(", ");
      const variations = parseVariations(product);
      const variants = variations.length ? variations : [{ key: "", label: "", options: {}, price: undefined }];

      return variants.map((variation) => {
        const color = specOrVariation(product, variation, "color", "colour");
        const size = specOrVariation(product, variation, "size");
        const material = specOrVariation(product, variation, "material");
        const gender = specOrVariation(product, variation, "gender");
        const ageGroup = specOrVariation(product, variation, "age_group", "age group");
        const pattern = specOrVariation(product, variation, "pattern");
        const variantId = variation.key ? `${itemGroupId}-${variation.key}` : itemGroupId;
        const variantUrl = variation.key ? `${productUrl}?variant=${encodeURIComponent(variation.key)}` : productUrl;
        const variantGtin = specOrVariation(product, variation, "gtin", "ean", "upc", "isbn");
        const variantMpn = specOrVariation(product, variation, "mpn", "manufacturer part number", "part number");
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
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:price>${xml(`${price} ${product.currency}`)}</g:price>
      <g:canonical_link>${xml(productUrl)}</g:canonical_link>
      <g:product_type>${xml(product.category.name)}</g:product_type>${category ? `
      <g:google_product_category>${xml(category)}</g:google_product_category>` : ""}
      <g:identifier_exists>${variantGtin || (brand && variantMpn) ? "yes" : "no"}</g:identifier_exists>${brand ? `
      <g:brand>${xml(text(brand, 70))}</g:brand>` : ""}${variantGtin ? `
      <g:gtin>${xml(text(variantGtin, 70))}</g:gtin>` : ""}${variantMpn ? `
      <g:mpn>${xml(text(variantMpn, 70))}</g:mpn>` : ""}${variantOption ? `
      <g:variant_option>${xml(text(variantOption, 500))}</g:variant_option>` : ""}${color ? `
      <g:color>${xml(text(color, 100))}</g:color>` : ""}${size ? `
      <g:size>${xml(text(size, 100))}</g:size>` : ""}${material ? `
      <g:material>${xml(text(material, 100))}</g:material>` : ""}${gender ? `
      <g:gender>${xml(text(gender, 50))}</g:gender>` : ""}${ageGroup ? `
      <g:age_group>${xml(text(ageGroup, 50))}</g:age_group>` : ""}${pattern ? `
      <g:pattern>${xml(text(pattern, 100))}</g:pattern>` : ""}${tags ? `
      <g:custom_label_0>${xml(text(tags, 100))}</g:custom_label_0>` : ""}
      <g:custom_label_1>${xml(product.vendor.storeName)}</g:custom_label_1>
      <g:custom_label_2>${xml(product.vendor.storeSlug)}</g:custom_label_2>
    </item>`;
      });
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
