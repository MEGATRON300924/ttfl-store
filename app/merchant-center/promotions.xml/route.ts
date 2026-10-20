import { NextResponse } from "next/server";

export const revalidate = 3600;

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://ttfl-store-backend-af5u.onrender.com"
    : "http://localhost:4000")
).replace(/\/$/, "");

type FlashDeal = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number | string;
  salePrice: number | string;
  discountPercent: number | string;
  endsAt: string;
};

type FlashDealsResponse = { deals: FlashDeal[] };

function xml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function promotionEntry(deal: FlashDeal, now: Date): string | null {
  const price = Number(deal.price);
  const salePrice = Number(deal.salePrice);
  const percentOff = Math.round(Number(deal.discountPercent));
  const end = new Date(deal.endsAt);

  // Only publish real, currently active discounts with a valid future end date.
  if (
    !deal.id ||
    !deal.productId ||
    !deal.name ||
    !Number.isFinite(price) ||
    !Number.isFinite(salePrice) ||
    price <= 0 ||
    salePrice < 0 ||
    salePrice >= price ||
    !Number.isFinite(percentOff) ||
    percentOff < 1 ||
    !Number.isFinite(end.getTime()) ||
    end <= now
  ) {
    return null;
  }

  const effectiveDates = `${now.toISOString().replace(/\.\d{3}Z$/, "Z")}/${end.toISOString().replace(/\.\d{3}Z$/, "Z")}`;
  const title = `Save ${percentOff}% on ${deal.name}`.slice(0, 60);

  return `    <item>
      <g:promotion_id>${xml(`ttfl-flash-deal-${deal.id}`)}</g:promotion_id>
      <g:product_applicability>specific_products</g:product_applicability>
      <g:offer_type>no_code</g:offer_type>
      <g:long_title>${xml(title)}</g:long_title>
      <g:promotion_effective_dates>${xml(effectiveDates)}</g:promotion_effective_dates>
      <g:redemption_channel>online</g:redemption_channel>
      <g:item_id>${xml(deal.productId)}</g:item_id>
      <g:percent_off>${percentOff}</g:percent_off>
    </item>`;
}

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/flash-deals`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Flash deals API returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as FlashDealsResponse;
    if (!Array.isArray(data.deals)) {
      throw new Error("Unexpected flash deals API response");
    }

    const now = new Date();
    const entries = data.deals
      .map((deal) => promotionEntry(deal, now))
      .filter((entry): entry is string => Boolean(entry));

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>TTFL Store Flash Deal Promotions</title>
    <link>https://ttflstore.name.ng</link>
    <description>Automatically updated promotions for active TTFL Store flash deals</description>
${entries.join("\n")}
  </channel>
</rss>
`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Google Merchant promotions feed failed", error);
    return new NextResponse("Promotions feed is temporarily unavailable. Please retry later.\n", {
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
