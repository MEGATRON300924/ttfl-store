import type { ApiProductVariation } from "@/lib/api-types";

type GoogleProduct = {
  specifications?: Record<string, string> | null;
};

type GoogleCategoryProduct = GoogleProduct & {
  name: string;
  category: {
    slug?: string;
    name?: string;
  };
};

export function normalizeGoogleAttribute(value?: string): string {
  return String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

export function canonicalGoogleAttribute(value: string): string {
  const key = normalizeGoogleAttribute(value);
  if (/^(color|colour)$/.test(key)) return "color";
  if (/^(size|sizes)$/.test(key)) return "size";
  if (/^(material|materials|fabric)$/.test(key)) return "material";
  if (/^(gender|sex)$/.test(key)) return "gender";
  if (/^(age group|agegroup|age)$/.test(key)) return "age_group";
  if (/^(pattern|design)$/.test(key)) return "pattern";
  if (/^(brand|manufacturer|make)$/.test(key)) return "brand";
  if (/^(gtin|ean|upc|isbn|barcode)$/.test(key)) return "gtin";
  if (/^(mpn|manufacturer part number|part number|model number)$/.test(key)) return "mpn";
  return key;
}

export function getGoogleSpec(product: GoogleProduct, ...keys: string[]): string | undefined {
  const entries = Object.entries(product.specifications ?? {});
  for (const key of keys) {
    const wanted = canonicalGoogleAttribute(key);
    const found = entries.find(([name]) => canonicalGoogleAttribute(name) === wanted);
    if (found?.[1]) return String(found[1]).trim();
  }
  return undefined;
}

export function getGoogleVariantSpec(
  variation: Pick<ApiProductVariation, "options"> | null,
  product: GoogleProduct,
  ...keys: string[]
): string | undefined {
  const options = variation?.options ?? {};
  for (const key of keys) {
    const wanted = canonicalGoogleAttribute(key);
    const found = Object.entries(options).find(([name]) => canonicalGoogleAttribute(name) === wanted);
    if (found?.[1]) return String(found[1]).trim();
  }
  return getGoogleSpec(product, ...keys);
}

export function getGoogleBrand(product: GoogleProduct): string | undefined {
  return getGoogleSpec(product, "brand", "manufacturer", "make");
}

export function getGoogleGtin(product: GoogleProduct): string | undefined {
  return getGoogleSpec(product, "gtin", "ean", "upc", "isbn", "barcode");
}

export function getGoogleMpn(product: GoogleProduct): string | undefined {
  return getGoogleSpec(product, "mpn", "manufacturer part number", "part number", "model number");
}

export function getGoogleProductCategory(product: GoogleCategoryProduct): string | undefined {
  const category = normalizeGoogleAttribute(product.category.slug || product.category.name);
  const name = normalizeGoogleAttribute(product.name);
  const specs = Object.entries(product.specifications ?? {})
    .filter(([key]) => !key.startsWith("_"))
    .map(([key, value]) => normalizeGoogleAttribute(key) + " " + normalizeGoogleAttribute(value))
    .join(" ");
  const haystack = [category, name, specs].join(" ");

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
  if (/running shoe|running shoes|sneaker|sneakers|trainer|trainers|football boot|soccer cleat|basketball shoe|shoe|shoes|footwear|boots|sandals|slippers|heels/.test(haystack)) return "Apparel & Accessories > Shoes";
  if (/t-shirt|tshirt|shirt|blouse|top|hoodie|sweatshirt|jacket|coat|dress|skirt|trouser|pants|jeans|shorts|clothing|apparel/.test(haystack)) return "Apparel & Accessories > Clothing";
  if (/handbag|purse|backpack|wallet|luggage|suitcase|bag/.test(haystack)) return "Apparel & Accessories > Handbags, Wallets & Cases";
  if (/jewelry|jewellery|necklace|bracelet|earring|ring/.test(haystack)) return "Apparel & Accessories > Jewelry";
  if (/watch|wristwatch/.test(haystack)) return "Apparel & Accessories > Jewelry > Watches";
  if (/shampoo|conditioner|hair care|haircare|wig|hair extension/.test(haystack)) return "Health & Beauty > Personal Care > Hair Care";
  if (/makeup|cosmetic|skincare|skin care|foundation|lipstick|mascara|perfume|fragrance|beauty/.test(haystack)) return "Health & Beauty";
  if (/sofa|couch|bed|mattress|wardrobe|cabinet|table|chair|desk|furniture/.test(haystack)) return "Home & Garden > Furniture";
  if (/kitchen|cookware|pot|pan|blender|kettle|air fryer|utensil/.test(haystack)) return "Home & Garden > Kitchen & Dining";
  if (/garden|outdoor|lawn|plant pot|gardening/.test(haystack)) return "Home & Garden > Lawn & Garden";
  if (/bicycle|bike|cycling/.test(haystack)) return "Sporting Goods > Outdoor Recreation > Cycling";
  if (/running|football|soccer|basketball|tennis|gym|fitness|sports|sporting/.test(haystack)) return "Sporting Goods";
  if (/car part|auto part|automotive part|motorcycle part|vehicle part|tyre|tire|wheel|engine part|car|automobile|motorcycle|vehicle/.test(haystack)) return "Vehicles & Parts";
  if (/toy|toys|doll|action figure|puzzle|board game/.test(haystack)) return "Toys & Games";
  if (/book|novel|textbook|comic|magazine/.test(haystack)) return "Media > Books";
  if (/office|stationery|notebook paper|printer|school supplies/.test(haystack)) return "Office Supplies";
  return undefined;
}